from __future__ import annotations

import asyncio
from collections import deque
from typing import AsyncIterator

from app.models.contracts import AgentDecisionEvent
from app.services.storage import EventStore


class EventBus:
    def __init__(self, store: EventStore) -> None:
        self.store = store
        self._events: deque[AgentDecisionEvent] = deque(maxlen=500)
        self._condition = asyncio.Condition()
        self._sequence = 0

    async def publish(self, event: AgentDecisionEvent) -> None:
        await self.store.add_event(event.model_dump(mode="json"))
        async with self._condition:
            self._sequence += 1
            self._events.append(event)
            self._condition.notify_all()

    async def history(self, limit: int = 50) -> list[AgentDecisionEvent]:
        rows = await self.store.recent_events(limit)
        return [AgentDecisionEvent.model_validate(row) for row in rows]

    async def subscribe(self) -> AsyncIterator[AgentDecisionEvent]:
        cursor = self._sequence
        while True:
            async with self._condition:
                await self._condition.wait_for(lambda: self._sequence > cursor)
                new_events = list(self._events)
                new_sequence = self._sequence
            if new_events:
                yield new_events[-1]
            cursor = new_sequence
