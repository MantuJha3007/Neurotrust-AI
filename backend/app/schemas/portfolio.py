from typing import Literal
from pydantic import BaseModel

AssetType = Literal["stock", "etf", "option", "crypto"]
OrderSide = Literal["buy", "sell"]

class Portfolio(BaseModel):
    totalValue: float
    dailyPnl: float
    dailyPnlPercent: float
    totalReturn: float
    totalReturnPercent: float
    buyingPower: float
    invested: float
    openPositions: int
    cash: float

class Position(BaseModel):
    id: str
    symbol: str
    assetType: AssetType
    side: OrderSide
    quantity: float
    averagePrice: float
    currentPrice: float
    marketValue: float
    pnl: float
    pnlPercent: float
    delta: float | None = None
    gamma: float | None = None
    theta: float | None = None
    vega: float | None = None
    impliedVolatility: float | None = None
    status: Literal["open", "closing"] = "open"

class Trade(BaseModel):
    id: str
    symbol: str
    assetType: AssetType
    side: OrderSide
    quantity: float
    price: float
    pnl: float | None = None
    status: Literal["filled", "pending", "cancelled"]
    timestamp: str
