from app.schemas.trading import OrderCreateRequest, TradeDTO
from app.execution.engine import OrderExecutionEngine
from app.execution.models import OrderRequest, OrderSide, StrategyType
from app.services.trade_service import trade_service

class OrderService:
    def __init__(self, engine: OrderExecutionEngine):
        self.engine = engine

    def process_order(self, req: OrderCreateRequest) -> TradeDTO:
        side = OrderSide.BUY if req.action.upper() == "BUY" else OrderSide.SELL
        
        order_req = OrderRequest(
            symbol=req.symbol.upper(),
            strategy_type=StrategyType.SINGLE_STOCK,
            side=side,
            quantity=req.quantity,
            limit_price=req.limitPrice,
            order_type=req.orderType.lower()
        )

        result = self.engine.execute_order(order_req)
        price = result.filled_avg_price or (req.limitPrice or 178.32)

        trade = trade_service.record_trade(
            symbol=req.symbol,
            action=req.action.upper(),
            quantity=req.quantity,
            price=price,
            status=result.status.value
        )
        return trade
