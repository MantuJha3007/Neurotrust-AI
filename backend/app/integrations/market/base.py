from abc import ABC, abstractmethod
from typing import List
from app.execution.models import Quote, OptionContract

class MarketDataProvider(ABC):
    """
    Abstract Market Data Provider interface.
    Person 2 & AI/Quant agents consume this interface for quotes and option chains.
    Person 3 provides both MockMarketProvider and AlpacaMarketProvider implementations.
    """

    @abstractmethod
    def get_quote(self, symbol: str) -> Quote:
        """Fetch real-time bid/ask/last quote for stock or option."""
        pass

    @abstractmethod
    def get_option_contracts(
        self,
        symbol: str,
        expiration_min_days: int = 7,
        expiration_max_days: int = 30
    ) -> List[OptionContract]:
        """Fetch available option contract chain matching expiration filters."""
        pass
