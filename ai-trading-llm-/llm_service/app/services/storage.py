from __future__ import annotations

import asyncio
import json
import sqlite3
from pathlib import Path
from typing import Any


class EventStore:
    def __init__(self, path: str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, check_same_thread=False)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS decision_events (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    category TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT NOT NULL,
                    action TEXT,
                    status TEXT NOT NULL,
                    confidence REAL,
                    symbol TEXT,
                    contract TEXT,
                    metadata TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS decision_records (
                    id TEXT PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    symbol TEXT NOT NULL,
                    action TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )

    async def add_event(self, event: dict[str, Any]) -> None:
        async with self._lock:
            await asyncio.to_thread(self._add_event_sync, event)

    def _add_event_sync(self, event: dict[str, Any]) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                INSERT OR REPLACE INTO decision_events
                (id,timestamp,category,title,description,action,status,confidence,symbol,contract,metadata)
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    event["id"], event["timestamp"], event["category"], event["title"], event["description"],
                    event.get("action"), event["status"], event.get("confidence"), event.get("symbol"),
                    event.get("contract"), json.dumps(event.get("metadata", {})),
                ),
            )

    async def add_decision(self, decision: dict[str, Any]) -> None:
        async with self._lock:
            await asyncio.to_thread(self._add_decision_sync, decision)

    def _add_decision_sync(self, decision: dict[str, Any]) -> None:
        with self._connect() as connection:
            connection.execute(
                "INSERT OR REPLACE INTO decision_records (id,timestamp,symbol,action,payload) VALUES (?,?,?,?,?)",
                (decision["id"], decision["timestamp"], decision["symbol"], decision["action"], json.dumps(decision)),
            )

    async def recent_events(self, limit: int = 50) -> list[dict[str, Any]]:
        return await asyncio.to_thread(self._recent_events_sync, max(1, min(limit, 500)))

    def _recent_events_sync(self, limit: int) -> list[dict[str, Any]]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT * FROM decision_events ORDER BY timestamp DESC LIMIT ?", (limit,)
            ).fetchall()
        result = []
        for row in rows:
            item = dict(row)
            item["metadata"] = json.loads(item["metadata"])
            result.append(item)
        return result

    async def recent_decisions(self, limit: int = 20) -> list[dict[str, Any]]:
        return await asyncio.to_thread(self._recent_decisions_sync, max(1, min(limit, 200)))

    def _recent_decisions_sync(self, limit: int) -> list[dict[str, Any]]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT payload FROM decision_records ORDER BY timestamp DESC LIMIT ?", (limit,)
            ).fetchall()
        return [json.loads(row["payload"]) for row in rows]
