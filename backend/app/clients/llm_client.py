from typing import Any, AsyncGenerator
import httpx
from app.core.config import settings

class LLMClient:
    def __init__(self, base_url: str = settings.LLM_SERVICE_URL):
        self.base_url = base_url.rstrip("/")

    async def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        async with httpx.AsyncClient(timeout=15.0) as client:
            url = f"{self.base_url}{path}"
            response = await client.get(url, params=params)
            response.raise_for_status()
            return response.json()

    async def _post(self, path: str, json_data: dict[str, Any] | None = None, headers: dict[str, str] | None = None) -> Any:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"{self.base_url}{path}"
            response = await client.post(url, json=json_data, headers=headers)
            response.raise_for_status()
            return response.json()

    # Market Endpoints
    async def get_market_quotes(self) -> list[dict[str, Any]]:
        return await self._get("/api/market/quotes")

    async def get_market_chart(self, symbol: str, timeframe: str = "1D") -> list[dict[str, Any]]:
        return await self._get(f"/api/market/chart/{symbol}", params={"timeframe": timeframe})

    # Portfolio & Positions Endpoints
    async def get_portfolio(self) -> dict[str, Any]:
        return await self._get("/api/portfolio")

    async def get_positions(self) -> list[dict[str, Any]]:
        return await self._get("/api/portfolio/positions")

    async def get_trades(self) -> list[dict[str, Any]]:
        return await self._get("/api/trades")

    # Order Placement
    async def create_order(self, order_data: dict[str, Any], idempotency_key: str | None = None) -> dict[str, Any]:
        headers = {}
        if idempotency_key:
            headers["Idempotency-Key"] = idempotency_key
        return await self._post("/api/orders", json_data=order_data, headers=headers)

    # Options Endpoints
    async def get_option_chain(self, symbol: str, expiry: str | None = None) -> dict[str, Any]:
        params = {"expiry": expiry} if expiry else None
        return await self._get(f"/api/options/chain/{symbol}", params=params)

    async def get_option_contract(self, contract_symbol: str) -> dict[str, Any]:
        return await self._get(f"/api/options/contract/{contract_symbol}")

    # Agent Control & Decisions
    async def get_agent_status(self) -> dict[str, Any]:
        return await self._get("/api/agent/status")

    async def pause_agent(self) -> dict[str, Any]:
        return await self._post("/api/agent/pause")

    async def resume_agent(self) -> dict[str, Any]:
        return await self._post("/api/agent/resume")

    async def analyze_agent(self, symbol: str, include_options: bool = True, execute: bool = False) -> dict[str, Any]:
        payload = {
            "symbol": symbol,
            "include_options": include_options,
            "execute": execute
        }
        return await self._post("/api/agent/analyze", json_data=payload)

    async def get_agent_events(self) -> list[dict[str, Any]]:
        return await self._get("/api/agent/events")

    async def get_execution_events(self) -> list[dict[str, Any]]:
        return await self._get("/api/execution/events")

    # Streaming proxy generator for SSE
    async def stream_sse(self, path: str) -> AsyncGenerator[str, None]:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("GET", url) as response:
                async for line in response.aiter_lines():
                    if line is not None:
                        yield f"{line}\n"

llm_client = LLMClient()
