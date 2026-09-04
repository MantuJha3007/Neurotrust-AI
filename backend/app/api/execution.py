from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.clients.llm_client import llm_client
from app.schemas.execution import ExecutionEvent
from app.schemas.mappers import map_execution_event

router = APIRouter(prefix="/api/execution", tags=["Execution Streaming"])

@router.get("/events", response_model=list[ExecutionEvent])
async def get_execution_events():
    try:
        raw_events = await llm_client.get_execution_events()
        return [map_execution_event(ev) for ev in raw_events]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch execution events: {str(exc)}")

@router.get("/events/stream")
async def stream_execution_events():
    return StreamingResponse(
        llm_client.stream_sse("/api/execution/events/stream"),
        media_type="text/event-stream"
    )
