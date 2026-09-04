from typing import Literal, Any
from pydantic import BaseModel, Field

AgentStatus = Literal["active", "paused", "evaluating"]
MarketRegime = Literal["bullish", "bearish", "neutral", "high-volatility", "low-volatility"]
RiskLevel = Literal["low", "moderate", "high", "critical"]
AgentAction = Literal["analyze", "buy", "sell", "hold", "hedge", "reject", "execute", "monitor"]
DecisionEventStatus = Literal["pending", "running", "completed", "warning", "failed"]
DecisionEventCategory = Literal["market", "signal", "strategy", "risk", "execution", "system"]

class AgentSignal(BaseModel):
    symbol: str
    action: Literal["buy", "sell", "hold", "reject"]
    contract: str | None = None
    strike: float | None = None
    expiry: str | None = None
    impliedVolatility: float | None = None
    expectedRealizedVolatility: float | None = None
    edge: float = 0.0
    confidence: float
    suggestedSize: float
    factors: list[str] = Field(default_factory=list)

class AgentRisk(BaseModel):
    portfolioExposure: float
    dailyLoss: float
    dailyLossLimit: float
    maxPositionRisk: float
    portfolioDelta: float
    portfolioVega: float
    concentration: Literal["low", "moderate", "high"] = "low"
    status: Literal["safe", "warning", "blocked"] = "safe"

class DecisionEvent(BaseModel):
    id: str
    timestamp: str
    title: str
    description: str
    status: Literal["completed", "running", "warning", "failed", "pending"] = "completed"

class AgentDecisionEvent(BaseModel):
    id: str
    timestamp: str
    category: DecisionEventCategory
    title: str
    description: str
    action: AgentAction | None = None
    status: DecisionEventStatus
    confidence: float | None = None
    symbol: str | None = None
    contract: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

class AgentState(BaseModel):
    status: AgentStatus
    regime: str
    confidence: float
    riskLevel: RiskLevel
    latestSignal: AgentSignal | None = None
    risk: AgentRisk
    timeline: list[DecisionEvent] = Field(default_factory=list)
    lastDecision: str

class AgentAnalyzeRequest(BaseModel):
    symbol: str
    includeOptions: bool = True
    execute: bool = False

class AgentDecision(BaseModel):
    id: str
    timestamp: str
    symbol: str
    action: AgentAction
    contract: str | None = None
    strategy: str | None = None
    confidence: float
    rationale: str
    expectedEdge: float | None = None
    riskScore: float | None = None
    suggestedSize: float | None = None
