import uuid
from typing import Optional
from datetime import datetime
from app.integrations.broker.base import BrokerProvider
from app.execution.models import OrderRequest, ExecutionResult, OrderState
from app.execution.guardrails import validate_order_guardrails
from app.execution.logger import audit_logger

class OrderExecutionEngine:
    """
    Person 3 Main Execution Engine & Pipeline Orchestrator.
    Manages order validation, guardrails, state machine transitions, broker submission,
    and audit logging.
    """

    def __init__(self, broker: BrokerProvider):
        self.broker = broker

    def execute_order(self, order_req: OrderRequest) -> ExecutionResult:
        order_id = order_req.order_id or f"ord-{uuid.uuid4().hex[:8]}"
        order_req.order_id = order_id
        now = datetime.utcnow()

        # Step 1: Signal Received & Created State
        audit_logger.log_event(
            order_id=order_id,
            event_type="ORDER_CREATED",
            message=f"Order created for {order_req.symbol} ({order_req.strategy_type})",
            details=order_req.dict()
        )

        # Step 2: Fetch Account Info
        account = self.broker.get_account()

        # Step 3: Run Execution Guardrails Safety Validation
        passed, error_reason = validate_order_guardrails(order_req, account)
        if not passed:
            audit_logger.log_event(
                order_id=order_id,
                event_type="GUARDRAIL_FAILED",
                message=f"Order rejected by safety guardrails: {error_reason}",
                details={"error": error_reason}
            )

            result = ExecutionResult(
                order_id=order_id,
                broker_order_id=None,
                status=OrderState.REJECTED,
                symbol=order_req.symbol,
                strategy_type=order_req.strategy_type,
                side=order_req.side,
                quantity=order_req.quantity,
                filled_qty=0,
                filled_avg_price=None,
                created_at=now,
                updated_at=now,
                error_message=error_reason,
                audit_logs=[e.message for e in audit_logger.get_events_for_order(order_id)]
            )
            return result

        audit_logger.log_event(
            order_id=order_id,
            event_type="VALIDATION_PASSED",
            message="Execution safety guardrails passed cleanly"
        )

        # Step 4: Submit Order to Active Broker (Mock / Alpaca)
        audit_logger.log_event(
            order_id=order_id,
            event_type="SUBMITTING_TO_BROKER",
            message=f"Submitting order to active broker provider ({self.broker.__class__.__name__})"
        )

        result = self.broker.submit_order(order_req)

        # Step 5: Log Execution Outcome
        if result.status in [OrderState.FILLED, OrderState.SUBMITTED]:
            audit_logger.log_event(
                order_id=order_id,
                event_type="ORDER_SUCCESSFUL",
                message=f"Order {result.status.value}: Broker ID {result.broker_order_id}",
                details={"status": result.status.value, "filled_price": result.filled_avg_price}
            )
        else:
            audit_logger.log_event(
                order_id=order_id,
                event_type="ORDER_FAILED",
                message=f"Order execution failed/rejected: {result.error_message}",
                details={"error": result.error_message}
            )

        # Attach comprehensive audit logs
        result.audit_logs = [e.message for e in audit_logger.get_events_for_order(order_id)]
        return result
