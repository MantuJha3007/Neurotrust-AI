from app.integrations.market.base import MarketDataProvider
from app.schemas.trading import MarketAsset
from app.data.mock_data import TICKER_NAMES

class MarketService:
    def __init__(self, provider: MarketDataProvider):
        self.provider = provider

    def get_market_asset(self, symbol: str) -> MarketAsset:
        quote = self.provider.get_quote(symbol.upper())
        name = TICKER_NAMES.get(symbol.upper(), f"{symbol.upper()} Corp")
        
        # Estimate change & percent change
        change = round(quote.last * 0.0241, 2)
        change_pct = 2.41
        volume = 18240000

        return MarketAsset(
            symbol=quote.symbol,
            name=name,
            price=quote.last,
            change=change,
            changePercent=change_pct,
            volume=volume
        )
