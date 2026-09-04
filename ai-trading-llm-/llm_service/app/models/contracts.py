from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class AgentStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"


class AgentAction(str, Enum):
    ANALYZE = "analyze"
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"
    HEDGE = "hedge"
    REJECT = "reject"
    EXECUTE = "execute"
    MONITOR = "monitor"


class DecisionEventStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    WARNING = "warning"
    FAILED = "failed"


class DecisionEventCategory(str, Enum):
    MARKET = "market"
    SIGNAL = "signal"
    STRATEGY = "strategy"
    RISK = "risk"
    EXECUTION = "execution"
    SYSTEM = "system"


class ExecutionStatus(str, Enum):
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    PARTIAL = "partial"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class Quote(BaseModel):
    symbol: str
    price: float
    change: float = 0.0
    change_percent: float = 0.0
    volume: int = 0
    market_status: str = "unknown"
    timestamp: str


class ChartPoint(BaseModel):
    timestamp: str
    price: float
    volume: float = 0.0
    open: float | None = None
    high: float | None = None
    low: float | None = None
    close: float | None = None


class Portfolio(BaseModel):
    total_value: float
    daily_pnl: float
    daily_pnl_percent: float
    total_return: float
    total_return_percent: float
    buying_power: float
    invested: float
    open_positions: int
    cash: float


class Position(BaseModel):
    id: str
    symbol: str
    asset_type: str
    side: Literal["buy", "sell"]
    quantity: float
    average_price: float
    current_price: float
    market_value: float
    pnl: float
    pnl_percent: float
    status: str
    delta: float | None = None
    gamma: float | None = None
    theta: float | None = None
    vega: float | None = None
    implied_volatility: float | None = None
    expiry: str | None = None
    strike: float | None = None


class OptionContract(BaseModel):
    symbol: str
    contract_symbol: str
    strike: float
    expiry: str
    type: Literal["call", "put"]
    bid: float
    ask: float
    last: float
    volume: int
    open_interest: int
    implied_volatility: float
    delta: float
    gamma: float
    theta: float
    vega: float


class OptionChain(BaseModel):
    symbol: str
    underlying_price: float
    expiry: str
    calls: list[OptionContract]
    puts: list[OptionContract]
    timestamp: str


class RiskSummary(BaseModel):
    portfolio_delta: float
    portfolio_gamma: float
    portfolio_theta: float
    portfolio_vega: float
    exposure_percent: float
    daily_loss: float
    daily_loss_limit: float
    max_position_risk: float
    max_drawdown: float | None = None
    risk_score: float
    status: Literal["safe", "warning", "blocked"]
    concentration: str


class AgentSignal(BaseModel):
    symbol: str
    action: Literal["buy", "sell", "hold", "reject"]
    contract: str | None = None
    strike: float | None = None
    expiry: str | None = None
    implied_volatility: float | None = None
    expected_realized_volatility: float | None = None
    edge: float = 0.0
    confidence: float = Field(ge=0, le=100)
    suggested_size: float = Field(ge=0)
    factors: list[str] = Field(min_length=1)


class AgentDecision(BaseModel):
    id: str
    timestamp: str
    symbol: str
    action: AgentAction
    contract: str | None = None
    strategy: str | None = None
    confidence: float = Field(ge=0, le=100)
    rationale: str
    expected_edge: float | None = None
    risk_score: float | None = Field(default=None, ge=0, le=100)
    suggested_size: float | None = Field(default=None, ge=0)


class AgentDecisionEvent(BaseModel):
    id: str
    timestamp: str
    category: DecisionEventCategory
    title: str
    description: str
    action: AgentAction | None = None
    status: DecisionEventStatus
    confidence: float | None = Field(default=None, ge=0, le=100)
    symbol: str | None = None
    contract: str | None = None
    metadata: dict[str, str | float | int | bool] = Field(default_factory=dict)


class ExecutionEvent(BaseModel):
    id: str
    timestamp: str
    order_id: str
    symbol: str
    action: Literal["buy", "sell"]
    quantity: float
    price: float | None = None
    status: ExecutionStatus
    message: str


class AgentState(BaseModel):
    status: AgentStatus
    regime: str
    confidence: float = Field(ge=0, le=100)
    risk_level: Literal["low", "moderate", "high", "critical"]
    latest_signal: AgentSignal | None = None
    risk: RiskSummary
    last_decision: str
    updated_at: str


class OrderRequest(BaseModel):
    symbol: str
    side: Literal["buy", "sell"]
    quantity: float = Field(gt=0)
    order_type: Literal["market", "limit"] = "market"
    time_in_force: Literal["day", "gtc"] = "day"
    price: float | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def limit_requires_price(self) -> "OrderRequest":
        if self.order_type == "limit" and self.price is None:
            raise ValueError("price is required for limit orders")
        return self


class OrderResponse(BaseModel):
    order_id: str
    symbol: str
    side: Literal["buy", "sell"]
    quantity: float
    order_type: str
    time_in_force: str
    price: float | None = None
    status: str
    timestamp: str
    message: str


class AnalyzeRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=16)
    include_options: bool = True
    execute: bool = False

    @field_validator("symbol")
    @classmethod
    def normalize_symbol(cls, value: str) -> str:
        return value.strip().upper()


class HealthResponse(BaseModel):
    status: str
    environment: str
    groq_configured: bool
    alpaca_configured: bool
    agent_status: AgentStatus


class AgentContext(BaseModel):
    symbol: str
    quote: Quote
    chart: list[ChartPoint]
    portfolio: Portfolio
    positions: list[Position]
    option_chain: OptionChain | None
    risk: RiskSummary
    timestamp: str


class LLMDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")

    action: Literal["buy", "sell", "hold", "reject"]
    symbol: str
    contract: str | None
    strategy: str | None
    confidence: float = Field(ge=0, le=100)
    rationale: str = Field(min_length=1, max_length=2000)
    expected_edge: float
    suggested_size: float = Field(ge=0)
    factors: list[str] = Field(min_length=1, max_length=8)
    regime: str = Field(min_length=1, max_length=64)


class StrategyCandidate(BaseModel):
    name: str
    contract: str | None
    rationale: str
    max_loss: float | None
    capital_required: float
    score: float


class RiskCheckResult(BaseModel):
    approved: bool
    status: Literal["safe", "warning", "blocked"]
    risk_score: float = Field(ge=0, le=100)
    reasons: list[str]


class ServiceEvent(BaseModel):
    event: AgentDecisionEvent
    sequence: int
