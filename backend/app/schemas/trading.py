from pydantic import BaseModel, Field
from typing import List, Optional

class MarketAsset(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    changePercent: float
    volume: int

class PortfolioSummary(BaseModel):
    totalValue: float
    dailyPnl: float
    dailyPnlPercent: float
    buyingPower: float
    openPositions: int

class PositionDTO(BaseModel):
    symbol: str
    name: str
    quantity: float
    averagePrice: float
    currentPrice: float
    pnl: float
    pnlPercent: float

class TradeDTO(BaseModel):
    id: str
    symbol: str
    action: str  # BUY, SELL
    quantity: int
    price: float
    status: str  # FILLED, REJECTED, SUBMITTED
    timestamp: str

class AgentSignal(BaseModel):
    symbol: str
    action: str  # BUY, SELL, HOLD
    confidence: float
    expectedReturn: float
    risk: str  # LOW, MEDIUM, HIGH
    reason: List[str]

class AgentDecisionDTO(BaseModel):
    id: str
    title: str
    description: str
    timestamp: str
    status: str  # completed, in_progress, pending

class AgentStateResponse(BaseModel):
    status: str  # ACTIVE, IDLE, PAUSED
    currentSymbol: str
    confidence: float
    riskScore: float
    signal: AgentSignal
    decisions: List[AgentDecisionDTO] = Field(default_factory=list)

class OrderCreateRequest(BaseModel):
    symbol: str = Field(min_length=1, description="Symbol name e.g. NVDA")
    action: str = Field(pattern="^(BUY|SELL|buy|sell)$", description="Order action BUY or SELL")
    quantity: int = Field(gt=0, description="Quantity must be greater than 0")
    orderType: str = Field(default="MARKET", description="MARKET or LIMIT")
    limitPrice: Optional[float] = Field(default=None, description="Limit price if LIMIT order")
