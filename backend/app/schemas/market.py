from typing import Literal
from pydantic import BaseModel, Field

MarketStatus = Literal["open", "closed", "pre-market", "after-hours", "unknown"]

class Quote(BaseModel):
    symbol: str
    price: float
    change: float
    changePercent: float
    volume: int
    marketStatus: MarketStatus
    timestamp: str

class ChartPoint(BaseModel):
    timestamp: str
    price: float
    volume: float
    open: float
    high: float
    low: float
    close: float
