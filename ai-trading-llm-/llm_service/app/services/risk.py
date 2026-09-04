from __future__ import annotations

from app.core.config import Settings
from app.models.contracts import AgentContext, LLMDecision, RiskCheckResult, RiskSummary


class RiskEngine:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def evaluate_portfolio(self, context: AgentContext) -> RiskSummary:
        equity = max(context.portfolio.total_value, 1.0)
        exposure = sum(abs(p.market_value) for p in context.positions) / equity * 100
        delta = sum((p.delta or 0.0) * p.quantity for p in context.positions)
        gamma = sum((p.gamma or 0.0) * p.quantity for p in context.positions)
        theta = sum((p.theta or 0.0) * p.quantity for p in context.positions)
        vega = sum((p.vega or 0.0) * p.quantity for p in context.positions)
        daily_loss = max(0.0, -context.portfolio.daily_pnl)
        concentration = self._concentration(context)

        score = 0.0
        score += min(35.0, exposure / max(self.settings.agent_max_exposure_percent, 1.0) * 35.0)
        score += min(30.0, daily_loss / max(self.settings.agent_daily_loss_limit, 1.0) * 30.0)
        score += 20.0 if concentration == "high" else 10.0 if concentration == "moderate" else 0.0
        score += min(15.0, abs(delta) * 2.0)
        score = min(100.0, score)

        if daily_loss >= self.settings.agent_daily_loss_limit or exposure >= self.settings.agent_max_exposure_percent:
            status = "blocked"
        elif score >= 60:
            status = "warning"
        else:
            status = "safe"

        return RiskSummary(
            portfolio_delta=delta,
            portfolio_gamma=gamma,
            portfolio_theta=theta,
            portfolio_vega=vega,
            exposure_percent=exposure,
            daily_loss=daily_loss,
            daily_loss_limit=self.settings.agent_daily_loss_limit,
            max_position_risk=self.settings.agent_max_position_risk,
            risk_score=score,
            status=status,
            concentration=concentration,
        )

    def validate_trade(self, context: AgentContext, decision: LLMDecision) -> RiskCheckResult:
        reasons: list[str] = []
        portfolio_risk = context.risk
        proposed_risk = max(0.0, decision.suggested_size * max(abs(context.quote.price) * 0.02, 1.0))
        new_exposure = portfolio_risk.exposure_percent + (proposed_risk / max(context.portfolio.total_value, 1.0) * 100)

        if decision.action in {"hold", "reject"}:
            return RiskCheckResult(approved=False, status="safe", risk_score=portfolio_risk.risk_score, reasons=["No trade action requested"])
        if portfolio_risk.status == "blocked":
            reasons.append("Portfolio is already beyond a configured risk limit")
        if proposed_risk > self.settings.agent_max_position_risk:
            reasons.append("Proposed position exceeds maximum position risk")
        if new_exposure > self.settings.agent_max_exposure_percent:
            reasons.append("Proposed trade exceeds maximum portfolio exposure")
        if context.portfolio.buying_power <= 0:
            reasons.append("No buying power is available")

        approved = not reasons
        score = min(100.0, portfolio_risk.risk_score + (20.0 if proposed_risk > self.settings.agent_max_position_risk * 0.75 else 0.0))
        return RiskCheckResult(
            approved=approved,
            status="safe" if approved and score < 60 else "warning" if approved else "blocked",
            risk_score=score,
            reasons=reasons or ["Trade remains within configured risk limits"],
        )

    @staticmethod
    def _concentration(context: AgentContext) -> str:
        equity = max(context.portfolio.total_value, 1.0)
        largest = max((abs(p.market_value) for p in context.positions), default=0.0) / equity * 100
        if largest >= 35:
            return "high"
        if largest >= 20:
            return "moderate"
        return "low"
