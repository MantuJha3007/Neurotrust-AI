from typing import List
from app.integrations.alpaca.client import AlpacaClient
from app.execution.models import Position, OptionType

class AlpacaPositionsService:
    def __init__(self, client: AlpacaClient):
        self.client = client

    def get_positions(self) -> List[Position]:
        res = self.client.request("GET", "/v2/positions")
        if not res.get("success"):
            return []

        raw_positions = res.get("data", [])
        positions: List[Position] = []

        for p in raw_positions:
            asset_class = p.get("asset_class", "us_equity")
            symbol = p.get("symbol", "")
            
            # Parse option contract fields if option symbol
            strike = None
            expiration = None
            opt_type = None

            if asset_class == "us_option" or len(symbol) > 10:
                asset_class = "us_option"

            positions.append(
                Position(
                    symbol=symbol,
                    qty=float(p.get("qty", 0.0)),
                    side=p.get("side", "long"),
                    avg_entry_price=float(p.get("avg_entry_price", 0.0)),
                    current_price=float(p.get("current_price", 0.0)),
                    market_value=float(p.get("market_value", 0.0)),
                    unrealized_pl=float(p.get("unrealized_pl", 0.0)),
                    unrealized_plpc=float(p.get("unrealized_plpc", 0.0)),
                    asset_class=asset_class,
                    strike=strike,
                    expiration=expiration,
                    option_type=opt_type
                )
            )

        return positions
