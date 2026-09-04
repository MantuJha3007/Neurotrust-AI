from __future__ import annotations

import asyncio
import json
import logging
import random
from typing import TypeVar

from groq import AsyncGroq
from pydantic import BaseModel, ValidationError

from app.core.config import Settings
from app.core.errors import ConfigurationError, ExternalServiceError, ModelOutputError

T = TypeVar("T", bound=BaseModel)
logger = logging.getLogger(__name__)


class GroqService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = AsyncGroq(
            api_key=settings.groq_api_key.get_secret_value(),
            timeout=settings.groq_timeout_seconds,
            max_retries=0,
        ) if settings.groq_configured else None

    async def structured_completion(
        self,
        *,
        system_prompt: str,
        user_payload: dict,
        response_model: type[T],
    ) -> tuple[T, str]:
        if self.client is None:
            raise ConfigurationError("GROQ_API_KEY is not configured")

        schema = response_model.model_json_schema()
        last_error: Exception | None = None

        for model_index, model in enumerate(self.settings.groq_models):
            for attempt in range(self.settings.groq_max_retries + 1):
                try:
                    response = await self.client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {
                                "role": "user",
                                "content": json.dumps(user_payload, separators=(",", ":")),
                            },
                        ],
                        temperature=self.settings.groq_temperature,
                        response_format={
                            "type": "json_schema",
                            "json_schema": {
                                "name": response_model.__name__.lower(),
                                "strict": True,
                                "schema": schema,
                            },
                        },
                    )
                    content = response.choices[0].message.content
                    if not content:
                        raise ModelOutputError("Groq returned an empty structured response")
                    try:
                        return response_model.model_validate_json(content), model
                    except ValidationError as exc:
                        raise ModelOutputError(f"Model output validation failed: {exc}") from exc
                except Exception as exc:  # upstream SDK exceptions vary by version
                    last_error = exc
                    retryable = self._retryable(exc)
                    logger.warning(
                        "Groq request failed model=%s attempt=%d retryable=%s error=%s",
                        model,
                        attempt + 1,
                        retryable,
                        exc,
                    )
                    if retryable and attempt < self.settings.groq_max_retries:
                        delay = min(8.0, 0.75 * (2**attempt) + random.uniform(0, 0.25))
                        await asyncio.sleep(delay)
                        continue
                    break
            if model_index < len(self.settings.groq_models) - 1:
                logger.warning("Falling back from Groq model %s", model)

        raise ExternalServiceError(f"All Groq models failed: {last_error}") from last_error

    @staticmethod
    def _retryable(exc: Exception) -> bool:
        name = exc.__class__.__name__.lower()
        text = str(exc).lower()
        return any(
            token in name or token in text
            for token in ("rate", "timeout", "connection", "tempor", "503", "502", "504", "429")
        )
