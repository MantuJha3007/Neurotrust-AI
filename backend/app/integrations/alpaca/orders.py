import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from app.integrations.alpaca.client import AlpacaClient
from app.execution.models import OrderRequest, ExecutionResult, OrderState

class AlpacaOrdersService:
    def __init__(self, client: AlpacaClient):
        self.client = client

    def submit_order(self, order_req: OrderRequest) -> ExecutionResult:
        order_id = order_req.order_id or f"order-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()

        payload: Dict[str, Any] = {
            "symbol": order_req.symbol,
            "qty": str(order_req.quantity),
            "side": order_req.side.value,
            "type": order_req.order_type,
            "time_in_force": order_req.time_in_force,
            "client_order_id": order_id
        }

        if order_req.limit_price is not None:
            payload["limit_price"] = str(order_req.limit_price)

        # Multi-leg option order support for Alpaca Options API
        if order_req.legs:
            payload["order_class"] = "mleg" if len(order_req.legs) > 1 else "simple"
            legs_payload = []
            for leg in order_req.legs:
                legs_payload.append({
                    "symbol": leg.symbol,
                    "ratio_qty": str(leg.ratio_qty),
                    "side": leg.side.value
                })
            payload["legs"] = legs_payload

        res = self.client.request("POST", "/v2/orders", data=payload)

        if not res.get("success"):
            return ExecutionResult(
                order_id=order_id,
                broker_order_id=None,
                status=OrderState.REJECTED,
                symbol=order_req.symbol,
                strategy_type=order_req.strategy_type,
                side=order_req.side,
                quantity=order_req.quantity,
                filled_qty=0,
                filled_avg_price=None,
                created_at=now,
                updated_at=now,
                error_message=f"Alpaca submission failed: {res.get('error')}",
                audit_logs=[f"Order rejected by Alpaca API: {res.get('error')}"]
            )

        data = res["data"]
        status_str = data.get("status", "submitted").lower()
        mapped_status = OrderState.SUBMITTED
        if status_str in ["filled"]:
            mapped_status = OrderState.FILLED
        elif status_str in ["rejected", "canceled", "expired"]:
            mapped_status = OrderState.REJECTED

        return ExecutionResult(
            order_id=order_id,
            broker_order_id=data.get("id"),
            status=mapped_status,
            symbol=order_req.symbol,
            strategy_type=order_req.strategy_type,
            side=order_req.side,
            quantity=order_req.quantity,
            filled_qty=int(float(data.get("filled_qty", 0))),
            filled_avg_price=float(data.get("filled_avg_price", 0.0)) if data.get("filled_avg_price") else None,
            created_at=now,
            updated_at=now,
            audit_logs=[
                f"Order constructed for {order_req.symbol}",
                f"Submitted to Alpaca Paper API (broker_id={data.get('id')})",
                f"Alpaca status: {data.get('status')}"
            ]
        )

    def get_order(self, broker_order_id: str) -> Optional[Dict[str, Any]]:
        res = self.client.request("GET", f"/v2/orders/{broker_order_id}")
        if res.get("success"):
            return res.get("data")
        return None

    def cancel_order(self, broker_order_id: str) -> bool:
        res = self.client.request("DELETE", f"/v2/orders/{broker_order_id}")
        return res.get("success", False)
