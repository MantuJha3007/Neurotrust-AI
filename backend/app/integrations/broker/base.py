from abc import ABC, abstractmethod
from typing import List, Optional
from app.execution.models import AccountInfo, Position, OrderRequest, ExecutionResult

class BrokerProvider(ABC):
    """
    Abstract Broker Provider interface.
    Person 2's API services consume this interface directly.
    Person 3 provides both MockBroker and AlpacaBroker implementations.
    """
    
    @abstractmethod
    def get_account(self) -> AccountInfo:
        """Fetch current account information and buying power."""
        pass

    @abstractmethod
    def get_positions(self) -> List[Position]:
        """Fetch current active positions."""
        pass

    @abstractmethod
    def submit_order(self, order_req: OrderRequest) -> ExecutionResult:
        """Submit a single or multi-leg option order."""
        pass

    @abstractmethod
    def get_order(self, order_id: str) -> Optional[ExecutionResult]:
        """Fetch order status by order_id."""
        pass

    @abstractmethod
    def cancel_order(self, order_id: str) -> bool:
        """Cancel an open order by order_id."""
        pass
