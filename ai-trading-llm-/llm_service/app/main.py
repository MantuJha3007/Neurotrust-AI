from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.core.logging import configure_logging
from app.services.agent import AgentService
from app.services.events import EventBus
from app.services.llm import GroqService
from app.services.risk import RiskEngine
from app.services.storage import EventStore
from app.services.strategy import StrategyEngine
from app.tools.alpaca import AlpacaService


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging(settings.log_level)
    store = EventStore(settings.sqlite_path)
    events = EventBus(store)
    app.state.services = type("Services", (), {})()
    app.state.services.settings = settings
    app.state.services.store = store
    app.state.services.events = events
    app.state.services.llm = GroqService(settings)
    app.state.services.alpaca = AlpacaService(settings)
    app.state.services.risk = RiskEngine(settings)
    app.state.services.strategies = StrategyEngine()
    app.state.services.agent = AgentService(app.state.services.llm, app.state.services.risk, app.state.services.strategies, events, store)
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix=settings.api_prefix)
