from typing import List, Optional
from app.integrations.alpaca.client import AlpacaClient
from app.execution.models import OptionContract, OptionType

class AlpacaOptionsService:
    def __init__(self, client: AlpacaClient):
        self.client = client

    def get_option_contracts(
        self,
        symbol: str,
        expiration_min_days: int = 7,
        expiration_max_days: int = 30
    ) -> List[OptionContract]:
        params = {
            "underlying_symbols": symbol.upper(),
            "status": "active",
            "limit": 100
        }
        res = self.client.request("GET", "/v2/options/contracts", params=params)
        if not res.get("success"):
            return []

        raw_contracts = res.get("data", {}).get("option_contracts", [])
        contracts: List[OptionContract] = []

        for c in raw_contracts:
            exp = c.get("expiration_date", "")
            opt_type_str = c.get("type", "call").upper()
            opt_type = OptionType.CALL if opt_type_str == "CALL" else OptionType.PUT
            strike = float(c.get("strike_price", 0.0))

            contracts.append(
                OptionContract(
                    symbol=c.get("symbol", ""),
                    underlying_symbol=symbol.upper(),
                    strike=strike,
                    expiration=exp,
                    option_type=opt_type,
                    bid=float(c.get("close_price", 2.50) or 2.50),
                    ask=float(c.get("close_price", 2.60) or 2.60) + 0.10,
                    last=float(c.get("close_price", 2.55) or 2.55),
                    open_interest=int(c.get("open_interest", 500) or 500)
                )
            )

        return contracts
