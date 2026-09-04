from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AI Trading Agent LLM Service"
    environment: str = "development"
    log_level: str = "INFO"
    api_prefix: str = "/api"
    host: str = "0.0.0.0"
    port: int = 8001
    cors_origins: str = "http://localhost:3000"

    groq_api_key: SecretStr = Field(default=SecretStr(""), alias="GROQ_API_KEY")
    groq_primary_model: str = Field(default="openai/gpt-oss-120b", alias="GROQ_PRIMARY_MODEL")
    groq_fallback_models: str = Field(
        default="qwen/qwen3.8-27b,openai/gpt-oss-20b", alias="GROQ_FALLBACK_MODELS"
    )
    groq_timeout_seconds: float = Field(default=45.0, alias="GROQ_TIMEOUT_SECONDS")
    groq_max_retries: int = Field(default=4, alias="GROQ_MAX_RETRIES")
    groq_temperature: float = Field(default=0.0, alias="GROQ_TEMPERATURE")

    alpaca_api_key: SecretStr = Field(default=SecretStr(""), alias="ALPACA_API_KEY")
    alpaca_secret_key: SecretStr = Field(default=SecretStr(""), alias="ALPACA_SECRET_KEY")
    alpaca_paper: bool = Field(default=True, alias="ALPACA_PAPER")
    alpaca_data_feed: str = Field(default="iex", alias="ALPACA_DATA_FEED")

    agent_default_mode: Literal["paper", "live"] = Field(default="paper", alias="AGENT_DEFAULT_MODE")
    agent_max_position_risk: float = Field(default=850.0, alias="AGENT_MAX_POSITION_RISK")
    agent_daily_loss_limit: float = Field(default=2000.0, alias="AGENT_DAILY_LOSS_LIMIT")
    agent_max_exposure_percent: float = Field(default=90.0, alias="AGENT_MAX_EXPOSURE_PERCENT")
    agent_loop_seconds: int = Field(default=60, alias="AGENT_LOOP_SECONDS")
    watchlist: str = Field(default="SPY,AAPL,NVDA,QQQ", alias="WATCHLIST")

    mcp_server_name: str = Field(default="ai-trading-agent-mcp", alias="MCP_SERVER_NAME")
    mcp_transport: str = Field(default="stdio", alias="MCP_TRANSPORT")

    sqlite_path: str = Field(default="./data/trading_agent.db", alias="SQLITE_PATH")

    @field_validator("cors_origins")
    @classmethod
    def normalize_origins(cls, value: str) -> str:
        return value.strip()

    @property
    def groq_models(self) -> list[str]:
        fallbacks = [m.strip() for m in self.groq_fallback_models.split(",") if m.strip()]
        return list(dict.fromkeys([self.groq_primary_model, *fallbacks]))

    @property
    def alpaca_configured(self) -> bool:
        return bool(self.alpaca_api_key.get_secret_value() and self.alpaca_secret_key.get_secret_value())

    @property
    def groq_configured(self) -> bool:
        return bool(self.groq_api_key.get_secret_value())


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
