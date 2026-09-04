from app.models.contracts import AnalyzeRequest, OrderRequest


def test_analyze_request_normalizes_symbol() -> None:
    assert AnalyzeRequest(symbol=" aapl ").symbol == "AAPL"


def test_limit_order_requires_price() -> None:
    try:
        OrderRequest(symbol="AAPL", side="buy", quantity=1, order_type="limit")
    except ValueError:
        return
    raise AssertionError("limit order without price must be rejected")
