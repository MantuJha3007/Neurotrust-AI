import os
import json
from typing import Any, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "NeuroTrust Autonomous AI Options Trading Gateway"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Internal LLM service endpoint
    LLM_SERVICE_URL: str = os.getenv("LLM_SERVICE_URL", "http://localhost:8001")
    
    # Gateway Server Settings
    PORT: int = int(os.getenv("PORT", "8080"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # CORS - supports comma-separated strings ("url1,url2"), wildcards ("*"), JSON lists, or lists
    CORS_ORIGINS: Union[list[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["http://localhost:3000", "http://127.0.0.1:3000"]
            if v == "*":
                return ["*"]
            if (v.startswith("[") and v.endswith("]")) or (v.startswith("(") and v.endswith(")")):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(x).strip() for x in parsed if str(x).strip()]
                except Exception:
                    pass
                v = v[1:-1].strip()
            return [x.strip().strip("'\"") for x in v.split(",") if x.strip().strip("'\"")]
        return ["*"]

    class Config:
        case_sensitive = True

settings = Settings()
