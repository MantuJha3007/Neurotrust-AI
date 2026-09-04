from typing import Literal
from pydantic import BaseModel

ExecutionStatus = Literal["submitted", "accepted", "partial", "filled", "cancelled", "rejected"]

class ExecutionEvent(BaseModel):
    id: str
    timestamp: str
    orderId: str
    symbol: str
    action: Literal["buy", "sell"]
    quantity: float
    price: float | None = None
    status: ExecutionStatus
    message: str
