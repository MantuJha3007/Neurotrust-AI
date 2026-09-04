from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from app.core.errors import ExternalServiceError
from app.models.contracts import (
    AgentContext, AgentDecision, AgentDecisionEvent, AgentSignal, AgentState, DecisionEventCategory,
    DecisionEventStatus, LLMDecision,
)
from app.services.events import EventBus
from app.services.llm import GroqService
from app.services.risk import RiskEngine
from app.services.storage import EventStore
from app.services.strategy import StrategyEngine

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the reasoning engine for a paper-first autonomous options trading system.
Use only supplied facts. Never invent prices, Greeks, account balances, or fills. Prefer HOLD/REJECT when evidence is insufficient.
Select a trade only when a defined-risk candidate is supported by the quantitative context and portfolio risk is acceptable.
Return only the requested structured JSON. Confidence is calibrated judgment, not certainty. Expected edge is a percentage supplied by your reasoning from the provided features and must not be represented as guaranteed profit."""


class AgentService:
    def __init__(self, llm: GroqService, risk: RiskEngine, strategies: StrategyEngine, events: EventBus, store: EventStore) -> None:
        self.llm = llm
        self.risk = risk
        self.strategies = strategies
        self.events = events
        self.store = store
        self.status = "active"
        self.last_state: AgentState | None = None

    async def analyze(self, context: AgentContext, execute: bool = False) -> AgentDecision:
        if self.status == "paused":
            raise ExternalServiceError("Agent is paused")

        await self.emit("Market data received", "Latest market snapshot processed.", DecisionEventCategory.MARKET, DecisionEventStatus.COMPLETED, symbol=context.symbol)
        await self.emit("Market regime evaluated", "Quantitative regime features are available to the reasoning engine.", DecisionEventCategory.MARKET, DecisionEventStatus.COMPLETED, symbol=context.symbol)

        candidates = self.strategies.generate(context.option_chain) if context.option_chain else []
        payload = {
            "context": context.model_dump(mode="json"),
            "strategy_candidates": [c.model_dump(mode="json") for c in candidates],
        }
        await self.emit("Trading opportunity evaluated", "LLM is evaluating the supplied market and strategy candidates.", DecisionEventCategory.SIGNAL, DecisionEventStatus.RUNNING, symbol=context.symbol)
        result, model = await self.llm.structured_completion(system_prompt=SYSTEM_PROMPT, user_payload=payload, response_model=LLMDecision)
        await self.emit("Trading opportunity detected", f"Model {model} returned a structured decision.", DecisionEventCategory.SIGNAL, DecisionEventStatus.COMPLETED, symbol=result.symbol, confidence=result.confidence)

        risk_check = self.risk.validate_trade(context, result)
        await self.emit(
            "Risk validation passed" if risk_check.approved else "Risk validation blocked",
            "; ".join(risk_check.reasons), DecisionEventCategory.RISK,
            DecisionEventStatus.COMPLETED if risk_check.approved else DecisionEventStatus.WARNING,
            symbol=result.symbol, confidence=result.confidence,
            metadata={"risk_score": risk_check.risk_score, "approved": risk_check.approved},
        )

        action = result.action if risk_check.approved else "reject"
        decision = AgentDecision(
            id=f"decision-{uuid.uuid4().hex[:12]}", timestamp=self._now(), symbol=result.symbol,
            action=action, contract=result.contract, strategy=result.strategy, confidence=result.confidence,
            rationale=result.rationale, expected_edge=result.expected_edge, risk_score=risk_check.risk_score,
            suggested_size=result.suggested_size if risk_check.approved else 0,
        )
        await self.store.add_decision(decision.model_dump(mode="json"))
        await self.emit("Agent decision", f"{result.symbol} — {action.upper()}", DecisionEventCategory.STRATEGY, DecisionEventStatus.COMPLETED, symbol=result.symbol, confidence=result.confidence, action=action)
        return decision

    async def emit(self, title: str, description: str, category: DecisionEventCategory, status: DecisionEventStatus, *, symbol: str | None = None, confidence: float | None = None, action: str | None = None, metadata: dict | None = None) -> None:
        event = AgentDecisionEvent(
            id=f"event-{uuid.uuid4().hex[:12]}", timestamp=self._now(), category=category, title=title,
            description=description, status=status, symbol=symbol, confidence=confidence,
            action=action, metadata=metadata or {},
        )
        await self.events.publish(event)

    def state(self, context: AgentContext) -> AgentState:
        signal = None
        if self.last_state:
            signal = self.last_state.latest_signal
        risk_level = "critical" if context.risk.status == "blocked" else "high" if context.risk.risk_score >= 75 else "moderate" if context.risk.risk_score >= 50 else "low"
        state = AgentState(
            status=self.status, regime="bullish" if context.quote.change_percent > 0 else "bearish" if context.quote.change_percent < 0 else "neutral",
            confidence=signal.confidence if signal else 0, risk_level=risk_level, latest_signal=signal,
            risk=context.risk, last_decision=self.last_state.last_decision if self.last_state else "No decision yet", updated_at=self._now(),
        )
        self.last_state = state
        return state

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()
