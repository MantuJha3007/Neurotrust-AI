from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.clients.llm_client import llm_client
from app.schemas.agent import (
    AgentState, AgentAnalyzeRequest, AgentDecision, AgentDecisionEvent
)
from app.schemas.mappers import map_agent_state, map_agent_decision, map_agent_decision_event

router = APIRouter(prefix="/api/agent", tags=["Agent Management"])

@router.get("/status", response_model=AgentState)
async def get_agent_status():
    try:
        raw_status = await llm_client.get_agent_status()
        # Fetch decision events to synthesize AgentState.timeline
        raw_events = []
        try:
            raw_events = await llm_client.get_agent_events()
        except Exception:
            pass

        return map_agent_state(raw_status, events=raw_events)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch agent status: {str(exc)}")

@router.post("/pause")
async def pause_agent():
    try:
        return await llm_client.pause_agent()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to pause agent: {str(exc)}")

@router.post("/resume")
async def resume_agent():
    try:
        return await llm_client.resume_agent()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to resume agent: {str(exc)}")

@router.post("/analyze", response_model=AgentDecision)
async def analyze_symbol(payload: AgentAnalyzeRequest):
    try:
        raw_decision = await llm_client.analyze_agent(
            symbol=payload.symbol,
            include_options=payload.includeOptions,
            execute=payload.execute
        )
        return map_agent_decision(raw_decision)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Agent analysis failed: {str(exc)}")

@router.get("/events", response_model=list[AgentDecisionEvent])
async def get_agent_events():
    try:
        raw_events = await llm_client.get_agent_events()
        return [map_agent_decision_event(ev) for ev in raw_events]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch agent events: {str(exc)}")

@router.get("/events/stream")
async def stream_agent_events():
    return StreamingResponse(
        llm_client.stream_sse("/api/agent/events/stream"),
        media_type="text/event-stream"
    )
