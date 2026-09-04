from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from app.core.config import get_settings
from app.services.storage import EventStore

settings = get_settings()
store = EventStore(settings.sqlite_path)
mcp = FastMCP(settings.mcp_server_name, json_response=True)


@mcp.tool()
async def get_recent_decisions(limit: int = 10) -> list[dict]:
    """Return recent structured agent decisions from the local decision store."""
    return await store.recent_decisions(limit)


@mcp.tool()
async def get_recent_decision_events(limit: int = 20) -> list[dict]:
    """Return recent decision timeline events from the local event store."""
    return await store.recent_events(limit)


@mcp.tool()
async def get_risk_policy() -> dict:
    """Return the deterministic risk limits used by the service."""
    return {
        "max_position_risk": settings.agent_max_position_risk,
        "daily_loss_limit": settings.agent_daily_loss_limit,
        "max_exposure_percent": settings.agent_max_exposure_percent,
        "mode": settings.agent_default_mode,
    }


if __name__ == "__main__":
    mcp.run(transport=settings.mcp_transport)
