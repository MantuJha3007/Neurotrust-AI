from fastapi import APIRouter, HTTPException, Header
from app.clients.llm_client import llm_client
from app.schemas.orders import OrderRequest, OrderResponse
from app.schemas.mappers import map_order_response

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# In-memory idempotency cache for duplicate request prevention
_idempotency_store: dict[str, OrderResponse] = {}

@router.post("", response_model=OrderResponse)
async def create_order(
    order: OrderRequest,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key")
):
    if idempotency_key and idempotency_key in _idempotency_store:
        return _idempotency_store[idempotency_key]

    order_payload = {
        "symbol": order.symbol.upper(),
        "side": order.side,
        "quantity": order.quantity,
        "order_type": order.orderType,
        "time_in_force": order.timeInForce,
        "price": order.price
    }

    try:
        raw_response = await llm_client.create_order(order_payload, idempotency_key=idempotency_key)
        mapped_response = map_order_response(raw_response)
        
        if idempotency_key:
            _idempotency_store[idempotency_key] = mapped_response

        return mapped_response
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to submit order: {str(exc)}")
