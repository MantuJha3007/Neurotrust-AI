from typing import List, Optional
from app.integrations.broker.base import BrokerProvider
from app.integrations.alpaca.client import AlpacaClient
from app.integrations.alpaca.account import AlpacaAccountService
from app.integrations.alpaca.positions import AlpacaPositionsService
from app.integrations.alpaca.orders import AlpacaOrdersService
from app.execution.models import AccountInfo, Position, OrderRequest, ExecutionResult

class AlpacaBroker(BrokerProvider):
    """
    Alpaca Paper Trading Implementation of BrokerProvider.
    Conforms strictly to the BrokerProvider abstract interface.
    """

    def __init__(self, client: Optional[AlpacaClient] = None):
        self.client = client or AlpacaClient()
        self.account_service = AlpacaAccountService(self.client)
        self.positions_service = AlpacaPositionsService(self.client)
        self.orders_service = AlpacaOrdersService(self.client)

    def get_account(self) -> AccountInfo:
        return self.account_service.get_account_info()

    def get_positions(self) -> List[Position]:
        return self.positions_service.get_positions()

    def submit_order(self, order_req: OrderRequest) -> ExecutionResult:
        return self.orders_service.submit_order(order_req)

    def get_order(self, order_id: str) -> Optional[ExecutionResult]:
        order_dict = self.orders_service.get_order(order_id)
        if not order_dict:
            return None
        # Return ExecutionResult summary
        return ExecutionResult(
            order_id=order_dict.get("client_order_id", order_id),
            broker_order_id=order_dict.get("id"),
            status=order_dict.get("status", "SUBMITTED").upper(),
            symbol=order_dict.get("symbol", ""),
            strategy_type=order_dict.get("strategy_type", "SINGLE_STOCK"),
            side=order_dict.get("side", "buy"),
            quantity=int(float(order_dict.get("qty", 1))),
            filled_qty=int(float(order_dict.get("filled_qty", 0)))
        )

    def cancel_order(self, order_id: str) -> bool:
        return self.orders_service.cancel_order(order_id)
