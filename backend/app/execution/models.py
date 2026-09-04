from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class OrderState(str, Enum):
    CREATED = "CREATED"
    VALIDATED = "VALIDATED"
    SUBMITTED = "SUBMITTED"
    PARTIALLY_FILLED = "PARTIALLY_FILLED"
    FILLED = "FILLED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"

class OptionType(str, Enum):
    CALL = "CALL"
    PUT = "PUT"

class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"

class StrategyType(str, Enum):
    SINGLE_STOCK = "SINGLE_STOCK"
    LONG_CALL = "LONG_CALL"
    LONG_PUT = "LONG_PUT"
    BULL_CALL_SPREAD = "BULL_CALL_SPREAD"
    BEAR_PUT_SPREAD = "BEAR_PUT_SPREAD"
    LONG_STRADDLE = "LONG_STRADDLE"
    IRON_CONDOR = "IRON_CONDOR"

class OptionLeg(BaseModel):
    symbol: str
    strike: float
    expiration: str  # YYYY-MM-DD
    option_type: OptionType
    side: OrderSide
    ratio_qty: int = 1

class OrderRequest(BaseModel):
    order_id: Optional[str] = None
    symbol: str
    strategy_type: StrategyType = StrategyType.SINGLE_STOCK
    side: OrderSide = OrderSide.BUY
    quantity: int = Field(gt=0, description="Number of shares or contract packages")
    limit_price: Optional[float] = None
    order_type: str = "market"  # market, limit
    time_in_force: str = "day"
    legs: List[OptionLeg] = Field(default_factory=list)

class ExecutionResult(BaseModel):
    order_id: str
    broker_order_id: Optional[str] = None
    status: OrderState
    symbol: str
    strategy_type: StrategyType
    side: OrderSide
    quantity: int
    filled_qty: int = 0
    filled_avg_price: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None
    audit_logs: List[str] = Field(default_factory=list)

class AccountInfo(BaseModel):
    account_number: str
    buying_power: float
    equity: float
    cash: float
    portfolio_value: float
    daytrading_buying_power: float
    is_paper: bool = True
    status: str = "ACTIVE"

class Position(BaseModel):
    symbol: str
    qty: float
    side: str
    avg_entry_price: float
    current_price: float
    market_value: float
    unrealized_pl: float
    unrealized_plpc: float
    asset_class: str = "us_option"  # us_equity or us_option
    strike: Optional[float] = None
    expiration: Optional[str] = None
    option_type: Optional[OptionType] = None

class Quote(BaseModel):
    symbol: str
    bid: float
    ask: float
    last: float
    bid_size: int = 100
    ask_size: int = 100
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class OptionContract(BaseModel):
    symbol: str
    underlying_symbol: str
    strike: float
    expiration: str  # YYYY-MM-DD
    option_type: OptionType
    bid: float
    ask: float
    last: float
    volume: int = 0
    open_interest: int = 0
    implied_volatility: float = 0.25
    delta: float = 0.50
    gamma: float = 0.05
    vega: float = 0.15
    theta: float = -0.05

class ExecutionAuditEvent(BaseModel):
    event_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    order_id: str
    event_type: str
    message: str
    details: Dict[str, Any] = Field(default_factory=dict)
