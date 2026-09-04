import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

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

def run_all_tests():
    print("=" * 60)
    print("RUNNING PERSON 3 TRADING ENGINE & EXECUTION TEST SUITE")
    print("=" * 60)

    passed = 0
    failed = 0

    def assert_test(name, condition, msg=""):
        nonlocal passed, failed
        if condition:
            print(f"  [PASS] {name}")
            passed += 1
        else:
            print(f"  [FAIL] {name} - {msg}")
            failed += 1

    # Test 1: Alpaca Client Safety Check
    try:
        c = AlpacaClient(base_url="https://paper-api.alpaca.markets")
        assert_test("1. Alpaca Client Paper URL Enforcement (Valid Paper URL)", c.base_url == "https://paper-api.alpaca.markets")
    except Exception as e:
        assert_test("1. Alpaca Client Paper URL Enforcement (Valid Paper URL)", False, str(e))

    try:
        AlpacaClient(base_url="https://api.alpaca.markets")
        assert_test("2. Alpaca Client Paper URL Enforcement (Live URL Blocked)", False, "Failed to block live URL")
    except ValueError:
        assert_test("2. Alpaca Client Paper URL Enforcement (Live URL Blocked)", True)

    # Test 2: Mock Broker Account & Buying Power
    broker = MockBroker(initial_cash=100000.0)
    acc = broker.get_account()
    assert_test("3. Mock Broker Account Cash ($100k)", acc.cash == 100000.0)
    assert_test("4. Mock Broker Buying Power ($100k)", acc.buying_power == 100000.0)
    assert_test("5. Mock Broker Positions Count (0)", len(broker.get_positions()) == 0)

    # Test 3: Mock Market Provider
    market = MockMarketProvider()
    q = market.get_quote("NVDA")
    assert_test("6. Mock Market Provider Stock Quote (NVDA)", q.symbol == "NVDA" and q.bid < q.ask)

    contracts = market.get_option_contracts("NVDA", 7, 30)
    assert_test("7. Mock Market Provider Options Chain (NVDA)", len(contracts) > 0 and contracts[0].underlying_symbol == "NVDA")

    # Test 4: Single Stock Execution Engine
    audit_logger.clear()
    engine = OrderExecutionEngine(broker=broker)
    req1 = OrderRequest(symbol="AAPL", strategy_type=StrategyType.SINGLE_STOCK, side=OrderSide.BUY, quantity=10, limit_price=150.0)
    res1 = engine.execute_order(req1)
    assert_test("8. Order Execution Engine Single Stock Fill (AAPL)", res1.status == OrderState.FILLED and res1.filled_qty == 10)

    # Test 5: Multi-Leg Bull Call Spread Execution
    audit_logger.clear()
    legs = [
        OptionLeg(symbol="NVDA260911C00180000", strike=180.0, expiration="2026-09-11", option_type=OptionType.CALL, side=OrderSide.BUY, ratio_qty=1),
        OptionLeg(symbol="NVDA260911C00190000", strike=190.0, expiration="2026-09-11", option_type=OptionType.CALL, side=OrderSide.SELL, ratio_qty=1)
    ]
    req2 = OrderRequest(symbol="NVDA", strategy_type=StrategyType.BULL_CALL_SPREAD, side=OrderSide.BUY, quantity=2, limit_price=3.50, legs=legs)
    res2 = engine.execute_order(req2)
    assert_test("9. Order Execution Engine Multi-Leg Bull Call Spread Fill (NVDA)", res2.status == OrderState.FILLED and res2.quantity == 2)

    # Test 6: Guardrail Rejection - Negative/Zero Qty
    try:
        req3 = OrderRequest(symbol="SPY", quantity=-5)
        res3 = engine.execute_order(req3)
        assert_test("10. Execution Guardrail Rejection (Negative Qty)", res3.status == OrderState.REJECTED)
    except Exception as e:
        assert_test("10. Execution Guardrail Rejection (Negative Qty caught at schema validation)", "greater_than" in str(e) or "Input should be greater than 0" in str(e))

    # Test 7: Guardrail Rejection - Insufficient Buying Power
    poor_broker = MockBroker(initial_cash=50.0)
    poor_engine = OrderExecutionEngine(broker=poor_broker)
    req4 = OrderRequest(symbol="TSLA", quantity=10, limit_price=200.0)
    res4 = poor_engine.execute_order(req4)
    assert_test("11. Execution Guardrail Rejection (Insufficient Buying Power)", res4.status == OrderState.REJECTED)

    # Test 8: Options Contract Selector
    selector = OptionsContractSelector(market_provider=market)
    candidates = selector.select_candidate_contracts("NVDA", direction="BULLISH")
    assert_test("12. Options Contract Selector Candidates (Calls & Puts Filtered)", len(candidates["calls"]) > 0 and len(candidates["puts"]) > 0)

    opt_leg = selector.get_optimal_single_leg("NVDA", direction="BULLISH")
    assert_test("13. Options Contract Selector Optimal Single Leg", opt_leg is not None and opt_leg.underlying_symbol == "NVDA")

    print("=" * 60)
    print(f"SUMMARY: {passed} PASSED, {failed} FAILED")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
