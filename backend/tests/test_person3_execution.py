import pytest
from datetime import datetime
from app.execution.models import (
    OrderRequest, OrderSide, StrategyType, OrderState, OptionLeg, OptionType
)
from app.integrations.broker.mock_broker import MockBroker
from app.integrations.market.mock_market import MockMarketProvider
from app.integrations.alpaca.client import AlpacaClient
from app.execution.engine import OrderExecutionEngine
from app.execution.guardrails import validate_order_guardrails
from app.execution.logger import audit_logger
from app.options.contract_selector import OptionsContractSelector

def test_alpaca_client_paper_enforcement():
    """Verify that AlpacaClient initializes and enforces paper API URL safety."""
    client = AlpacaClient(
        api_key="test_key",
        secret_key="test_secret",
        base_url="https://paper-api.alpaca.markets"
    )
    assert client.base_url == "https://paper-api.alpaca.markets"
    
    with pytest.raises(ValueError):
        AlpacaClient(base_url="https://api.alpaca.markets")  # Non-paper URL must throw safety exception!

def test_mock_broker_account_and_positions():
    """Verify MockBroker account balance and empty initial positions."""
    broker = MockBroker(initial_cash=100000.0)
    account = broker.get_account()
    
    assert account.buying_power == 100000.0
    assert account.equity == 100000.0
    assert account.is_paper is True
    assert len(broker.get_positions()) == 0

def test_mock_market_provider_quotes_and_options():
    """Verify MockMarketProvider returns realistic quotes and option chains."""
    market = MockMarketProvider()
    quote = market.get_quote("NVDA")
    
    assert quote.symbol == "NVDA"
    assert quote.bid < quote.ask
    assert quote.last > 0

    contracts = market.get_option_contracts("NVDA", expiration_min_days=7, expiration_max_days=30)
    assert len(contracts) > 0
    first = contracts[0]
    assert first.underlying_symbol == "NVDA"
    assert first.bid <= first.ask
    assert first.strike > 0

def test_order_execution_engine_single_stock_fill():
    """Verify end-to-end single stock order execution via OrderExecutionEngine."""
    audit_logger.clear()
    broker = MockBroker(initial_cash=50000.0)
    engine = OrderExecutionEngine(broker=broker)

    order_req = OrderRequest(
        symbol="AAPL",
        strategy_type=StrategyType.SINGLE_STOCK,
        side=OrderSide.BUY,
        quantity=10,
        limit_price=150.0
    )

    result = engine.execute_order(order_req)

    assert result.status == OrderState.FILLED
    assert result.filled_qty == 10
    assert result.filled_avg_price == 150.0
    assert len(result.audit_logs) >= 3
    assert len(broker.get_positions()) == 1

def test_order_execution_engine_bull_call_spread():
    """Verify multi-leg option order execution (Bull Call Spread)."""
    audit_logger.clear()
    broker = MockBroker(initial_cash=50000.0)
    engine = OrderExecutionEngine(broker=broker)

    legs = [
        OptionLeg(symbol="NVDA260911C00180000", strike=180.0, expiration="2026-09-11", option_type=OptionType.CALL, side=OrderSide.BUY, ratio_qty=1),
        OptionLeg(symbol="NVDA260911C00190000", strike=190.0, expiration="2026-09-11", option_type=OptionType.CALL, side=OrderSide.SELL, ratio_qty=1)
    ]

    order_req = OrderRequest(
        symbol="NVDA",
        strategy_type=StrategyType.BULL_CALL_SPREAD,
        side=OrderSide.BUY,
        quantity=2,
        limit_price=3.50,
        legs=legs
    )

    result = engine.execute_order(order_req)

    assert result.status == OrderState.FILLED
    assert result.quantity == 2
    assert result.filled_qty == 2
    assert result.strategy_type == StrategyType.BULL_CALL_SPREAD

def test_guardrails_rejection_invalid_quantity():
    """Verify guardrails reject negative/zero order quantity."""
    broker = MockBroker(initial_cash=50000.0)
    engine = OrderExecutionEngine(broker=broker)

    order_req = OrderRequest(
        symbol="SPY",
        quantity=-5
    )

    result = engine.execute_order(order_req)
    assert result.status == OrderState.REJECTED
    assert "Invalid order quantity" in result.error_message

def test_guardrails_rejection_insufficient_buying_power():
    """Verify guardrails reject orders exceeding available buying power."""
    broker = MockBroker(initial_cash=100.0)  # Only $100 buying power
    engine = OrderExecutionEngine(broker=broker)

    order_req = OrderRequest(
        symbol="TSLA",
        quantity=10,
        limit_price=200.0  # $2,000 order value > $100 cash
    )

    result = engine.execute_order(order_req)
    assert result.status == OrderState.REJECTED
    assert "Insufficient buying power" in result.error_message

def test_options_contract_selector():
    """Verify OptionsContractSelector filters candidates by liquidity & delta."""
    market = MockMarketProvider()
    selector = OptionsContractSelector(market_provider=market)

    candidates = selector.select_candidate_contracts("NVDA", direction="BULLISH")
    assert "calls" in candidates
    assert "puts" in candidates
    assert len(candidates["calls"]) > 0

    optimal_leg = selector.get_optimal_single_leg("NVDA", direction="BULLISH")
    assert optimal_leg is not None
    assert optimal_leg.underlying_symbol == "NVDA"
