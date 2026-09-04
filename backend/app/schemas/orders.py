from typing import Literal
from pydantic import BaseModel, Field

OrderSide = Literal["buy", "sell"]
OrderType = Literal["market", "limit", "stop"]
TimeInForce = Literal["day", "gtc"]

class OrderRequest(BaseModel):
    symbol: str
    side: OrderSide
    quantity: float = Field(gt=0)
    orderType: OrderType = "market"
    timeInForce: TimeInForce = "day"
    price: float | None = Field(default=None, gt=0)

class OrderResponse(BaseModel):
    orderId: str
    symbol: str
    side: OrderSide
    quantity: float
    orderType: OrderType
    timeInForce: TimeInForce
    price: float
    status: Literal["filled", "pending", "rejected"]
    timestamp: str
    message: str
