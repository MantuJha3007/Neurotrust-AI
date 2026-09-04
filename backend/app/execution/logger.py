import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.execution.models import ExecutionAuditEvent

class ExecutionAuditLogger:
    """
    Structured Execution Event Audit Logger.
    Tracks step-by-step order progression from signal receipt to fill/rejection.
    """

    def __init__(self):
        self._events: List[ExecutionAuditEvent] = []

    def log_event(
        self,
        order_id: str,
        event_type: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ) -> ExecutionAuditEvent:
        event = ExecutionAuditEvent(
            event_id=f"evt-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.utcnow(),
            order_id=order_id,
            event_type=event_type,
            message=message,
            details=details or {}
        )
        self._events.append(event)
        return event

    def get_events_for_order(self, order_id: str) -> List[ExecutionAuditEvent]:
        return [e for e in self._events if e.order_id == order_id]

    def get_all_events(self, limit: int = 100) -> List[ExecutionAuditEvent]:
        return sorted(self._events, key=lambda x: x.timestamp, reverse=True)[:limit]

    def clear(self):
        self._events.clear()

# Global Singleton Audit Logger
audit_logger = ExecutionAuditLogger()
