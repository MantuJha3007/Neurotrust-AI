from typing import List
from app.schemas.trading import AgentStateResponse, AgentDecisionDTO
from app.data.mock_data import DEFAULT_AGENT_STATE
from app.execution.logger import audit_logger

class AgentService:
    def get_agent_status(self) -> AgentStateResponse:
        events = audit_logger.get_all_events(limit=5)
        decisions: List[AgentDecisionDTO] = []

        if events:
            for i, evt in enumerate(reversed(events)):
                decisions.append(
                    AgentDecisionDTO(
                        id=str(i + 1),
                        title=evt.event_type.replace("_", " ").title(),
                        description=evt.message,
                        timestamp=evt.timestamp.strftime("%H:%M:%S"),
                        status="completed"
                    )
                )
        else:
            decisions = DEFAULT_AGENT_STATE.decisions

        return AgentStateResponse(
            status="ACTIVE",
            currentSymbol=DEFAULT_AGENT_STATE.currentSymbol,
            confidence=DEFAULT_AGENT_STATE.confidence,
            riskScore=DEFAULT_AGENT_STATE.riskScore,
            signal=DEFAULT_AGENT_STATE.signal,
            decisions=decisions
        )

    def get_agent_decisions(self) -> List[AgentDecisionDTO]:
        status_res = self.get_agent_status()
        return status_res.decisions

agent_service = AgentService()
