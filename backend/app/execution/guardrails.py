import os
from typing import Tuple, Optional
from app.execution.models import OrderRequest, AccountInfo, StrategyType

MAX_ORDER_VALUE = float(os.getenv("MAX_ORDER_VALUE", "5000.0"))
MAX_POSITION_SIZE = float(os.getenv("MAX_POSITION_SIZE", "10000.0"))

class ExecutionGuardrailError(Exception):
    """Exception raised when an order fails pre-submission safety checks."""
    pass

def validate_order_guardrails(
    order_req: OrderRequest,
    account: AccountInfo
) -> Tuple[bool, Optional[str]]:
    """
    Hard-stop execution-level safety checks before submitting orders to broker.
    Returns (passed: bool, error_reason: Optional[str]).
    """
    # 1. Quantity Check
    if order_req.quantity <= 0:
        return False, f"Invalid order quantity: {order_req.quantity} (must be > 0)"

    # 2. Symbol Format Check
    if not order_req.symbol or len(order_req.symbol.strip()) == 0:
        return False, "Invalid empty symbol"

    # 3. Paper Account Safety Verification
    if not account.is_paper:
        return False, "CRITICAL SAFETY BLOCKS: Refusing execution on non-paper live trading account!"

    # 4. Calculate estimated order value
    estimated_price = order_req.limit_price or (150.0 if order_req.strategy_type == StrategyType.SINGLE_STOCK else 3.50)
    multiplier = 1 if order_req.strategy_type == StrategyType.SINGLE_STOCK else 100
    estimated_cost = estimated_price * multiplier * order_req.quantity

    # 5. Single Order Value Guardrail
    if estimated_cost > MAX_ORDER_VALUE:
        return False, f"Order value ${estimated_cost:.2f} exceeds MAX_ORDER_VALUE limit (${MAX_ORDER_VALUE:.2f})"

    # 6. Buying Power Check
    if estimated_cost > account.buying_power:
        return False, f"Insufficient buying power: Required ${estimated_cost:.2f}, Available ${account.buying_power:.2f}"

    # 7. Legs validation for option strategies
    if order_req.strategy_type != StrategyType.SINGLE_STOCK:
        if not order_req.legs:
            return False, f"Option strategy '{order_req.strategy_type}' requires option legs"
        for i, leg in enumerate(order_req.legs):
            if leg.strike <= 0:
                return False, f"Option leg #{i+1} has invalid strike ${leg.strike}"
            if not leg.expiration:
                return False, f"Option leg #{i+1} missing expiration date"

    return True, None
