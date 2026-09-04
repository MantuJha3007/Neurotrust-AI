import os
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class AlpacaClient:
    """
    Alpaca Paper Trading REST Client Wrapper.
    Enforces paper trading endpoints to prevent live capital risk.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        self.api_key = api_key or os.getenv("ALPACA_API_KEY", "")
        self.secret_key = secret_key or os.getenv("ALPACA_SECRET_KEY", "")
        self.base_url = base_url or os.getenv("ALPACA_PAPER_BASE_URL", "https://paper-api.alpaca.markets")
        self.data_url = os.getenv("ALPACA_DATA_BASE_URL", "https://data.alpaca.markets")

        # Safety Check: Enforce paper trading base URL
        if "paper-api.alpaca.markets" not in self.base_url:
            raise ValueError(f"CRITICAL SAFETY VIOLATION: Non-paper Alpaca base URL detected: {self.base_url}")

    def get_headers(self) -> Dict[str, str]:
        return {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.secret_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    def request(self, method: str, path: str, data: Optional[Dict[str, Any]] = None, params: Optional[Dict[str, Any]] = None, is_data_api: bool = False) -> Dict[str, Any]:
        url = f"{self.data_url if is_data_api else self.base_url}{path}"
        headers = self.get_headers()

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params,
                timeout=10
            )

            if response.status_code >= 400:
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": response.text
                }

            return {
                "success": True,
                "status_code": response.status_code,
                "data": response.json()
            }
        except Exception as e:
            return {
                "success": False,
                "status_code": 500,
                "error": str(e)
            }
