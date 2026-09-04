from fastapi import APIRouter
from app.clients.llm_client import llm_client
from app.core.config import settings

router = APIRouter(prefix="/api/system", tags=["System Diagnostics"])

@router.get("/status")
async def get_system_status():
    """
    Returns sanitized system operational status and connectivity indicators.
    Strictly avoids exposing any internal network topology, ports, or API keys.
    """
    broker_connected = False
    ai_engine_connected = False
    environment = "development"
    agent_status = "active"
    active_model = "openai/gpt-oss-120b"

    try:
        health = await llm_client.get_health()
        broker_connected = bool(health.get("alpaca_configured", False))
        ai_engine_connected = bool(health.get("groq_configured", False))
        environment = health.get("environment", "development")
        agent_status = health.get("agent_status", "active")
    except Exception:
        # LLM engine may be starting up or unreachable
        pass

    return {
        "status": "ONLINE",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": environment,
        "trading_mode": "paper",
        "broker_connected": broker_connected,
        "ai_engine_connected": ai_engine_connected,
        "agent_status": agent_status,
        "active_model": active_model,
        "data_feed": "iex",
    }
