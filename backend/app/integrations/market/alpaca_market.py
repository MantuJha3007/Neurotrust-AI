from typing import List, Optional
from app.integrations.market.base import MarketDataProvider
from app.integrations.alpaca.client import AlpacaClient
from app.integrations.alpaca.market_data import AlpacaMarketDataService
from app.integrations.alpaca.options import AlpacaOptionsService
from app.execution.models import Quote, OptionContract

class AlpacaMarketProvider(MarketDataProvider):
    """
    Alpaca Market Data Implementation of MarketDataProvider.
    Conforms strictly to the MarketDataProvider abstract interface.
    """

    def __init__(self, client: Optional[AlpacaClient] = None):
        self.client = client or AlpacaClient()
        self.market_data_service = AlpacaMarketDataService(self.client)
        self.options_service = AlpacaOptionsService(self.client)

    def get_quote(self, symbol: str) -> Quote:
        return self.market_data_service.get_quote(symbol)

    def get_option_contracts(
        self,
        symbol: str,
        expiration_min_days: int = 7,
        expiration_max_days: int = 30
    ) -> List[OptionContract]:
        return self.options_service.get_option_contracts(
            symbol=symbol,
            expiration_min_days=expiration_min_days,
            expiration_max_days=expiration_max_days
        )
