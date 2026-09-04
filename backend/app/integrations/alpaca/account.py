from typing import Optional
from app.integrations.alpaca.client import AlpacaClient
from app.execution.models import AccountInfo

class AlpacaAccountService:
    def __init__(self, client: AlpacaClient):
        self.client = client

    def get_account_info(self) -> AccountInfo:
        res = self.client.request("GET", "/v2/account")
        if not res.get("success"):
            # Fallback for unconfigured or invalid keys in mock mode
            return AccountInfo(
                account_number="ALPACA-PAPER-UNCONFIGURED",
                buying_power=0.0,
                equity=0.0,
                cash=0.0,
                portfolio_value=0.0,
                daytrading_buying_power=0.0,
                is_paper=True,
                status="UNAUTHENTICATED"
            )

        data = res["data"]
        return AccountInfo(
            account_number=data.get("account_number", "ALPACA-PAPER"),
            buying_power=float(data.get("buying_power", 0.0)),
            equity=float(data.get("equity", 0.0)),
            cash=float(data.get("cash", 0.0)),
            portfolio_value=float(data.get("portfolio_value", 0.0)),
            daytrading_buying_power=float(data.get("daytrading_buying_power", 0.0)),
            is_paper=True,
            status=data.get("status", "ACTIVE")
        )
