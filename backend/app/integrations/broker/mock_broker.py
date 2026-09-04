import uuid
from typing import List, Optional, Dict
from datetime import datetime
from app.integrations.broker.base import BrokerProvider
from app.execution.models import (
    AccountInfo, Position, OrderRequest, ExecutionResult, OrderState, OrderSide, OptionType, StrategyType
)

class MockBroker(BrokerProvider):
    """
    Simulated Paper Broker for Person 3 Day 1 & Person 2 API testing.
    Maintains in-memory account, positions, and filled order history.
    """

    def __init__(self, initial_cash: float = 100000.0):
        self.account_number = "MOCK-PAPER-8899"
        self.cash = initial_cash
        self.buying_power = initial_cash
        self.portfolio_value = initial_cash
        self.positions: Dict[str, Position] = {}
        self.orders: Dict[str, ExecutionResult] = {}

    def get_account(self) -> AccountInfo:
        # Calculate current equity and portfolio value
        positions_value = sum(pos.market_value for pos in self.positions.values())
        self.portfolio_value = self.cash + positions_value
        self.buying_power = max(0.0, self.cash)

        return AccountInfo(
            account_number=self.account_number,
            buying_power=self.buying_power,
            equity=self.portfolio_value,
            cash=self.cash,
            portfolio_value=self.portfolio_value,
            daytrading_buying_power=self.buying_power * 2,
            is_paper=True,
            status="ACTIVE"
        )

    def get_positions(self) -> List[Position]:
        return list(self.positions.values())

    def submit_order(self, order_req: OrderRequest) -> ExecutionResult:
        order_id = order_req.order_id or f"mock-order-{uuid.uuid4().hex[:8]}"
        broker_order_id = f"alpaca-mock-{uuid.uuid4().hex[:6]}"
        now = datetime.utcnow()

        # Calculate estimated order cost / premium
        cost = 0.0
        if order_req.strategy_type == StrategyType.SINGLE_STOCK:
            unit_price = order_req.limit_price or 150.0
            cost = unit_price * order_req.quantity
        else:
            # Options premium estimate
            unit_price = order_req.limit_price or 3.50
            cost = unit_price * 100 * order_req.quantity  # 100 shares per contract

        if order_req.side == OrderSide.BUY and cost > self.buying_power:
            # Insufficient buying power
            result = ExecutionResult(
                order_id=order_id,
                broker_order_id=broker_order_id,
                status=OrderState.REJECTED,
                symbol=order_req.symbol,
                strategy_type=order_req.strategy_type,
                side=order_req.side,
                quantity=order_req.quantity,
                filled_qty=0,
                filled_avg_price=None,
                created_at=now,
                updated_at=now,
                error_message=f"Insufficient buying power (${self.buying_power:.2f} available, ${cost:.2f} required)",
                audit_logs=[f"Order rejected: Insufficient buying power"]
            )
            self.orders[order_id] = result
            return result

        # Fill order
        fill_price = unit_price
        filled_qty = order_req.quantity

        if order_req.side == OrderSide.BUY:
            self.cash -= cost
        else:
            self.cash += cost

        # Update positions
        pos_key = order_req.symbol if not order_req.legs else f"{order_req.symbol}_{order_req.strategy_type}"
        if pos_key in self.positions:
            existing = self.positions[pos_key]
            new_qty = existing.qty + filled_qty if order_req.side == OrderSide.BUY else existing.qty - filled_qty
            if new_qty <= 0:
                del self.positions[pos_key]
            else:
                existing.qty = new_qty
                existing.market_value = new_qty * fill_price * (100 if order_req.legs else 1)
        else:
            if order_req.side == OrderSide.BUY:
                mkt_val = filled_qty * fill_price * (100 if order_req.legs else 1)
                self.positions[pos_key] = Position(
                    symbol=pos_key,
                    qty=float(filled_qty),
                    side="long",
                    avg_entry_price=fill_price,
                    current_price=fill_price,
                    market_value=mkt_val,
                    unrealized_pl=0.0,
                    unrealized_plpc=0.0,
                    asset_class="us_option" if order_req.legs else "us_equity",
                    strike=order_req.legs[0].strike if order_req.legs else None,
                    expiration=order_req.legs[0].expiration if order_req.legs else None,
                    option_type=order_req.legs[0].option_type if order_req.legs else None,
                )

        result = ExecutionResult(
            order_id=order_id,
            broker_order_id=broker_order_id,
            status=OrderState.FILLED,
            symbol=order_req.symbol,
            strategy_type=order_req.strategy_type,
            side=order_req.side,
            quantity=order_req.quantity,
            filled_qty=filled_qty,
            filled_avg_price=fill_price,
            created_at=now,
            updated_at=now,
            audit_logs=[
                f"Order created for {order_req.symbol}",
                f"Guardrails passed",
                f"Order submitted to Mock Broker",
                f"Order FILLED @ ${fill_price:.2f}"
            ]
        )

        self.orders[order_id] = result
        return result

    def get_order(self, order_id: str) -> Optional[ExecutionResult]:
        return self.orders.get(order_id)

    def cancel_order(self, order_id: str) -> bool:
        if order_id in self.orders:
            order = self.orders[order_id]
            if order.status in [OrderState.CREATED, OrderState.SUBMITTED]:
                order.status = OrderState.CANCELLED
                order.updated_at = datetime.utcnow()
                order.audit_logs.append("Order CANCELLED by user")
                return True
        return False
