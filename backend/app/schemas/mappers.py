from typing import Any
from app.schemas.market import Quote, ChartPoint
from app.schemas.portfolio import Portfolio, Position, Trade
from app.schemas.orders import OrderResponse
from app.schemas.options import OptionContract, OptionChain, OptionQuote
from app.schemas.agent import (
    AgentState, AgentSignal, AgentRisk, DecisionEvent, AgentDecisionEvent, AgentDecision
)
from app.schemas.execution import ExecutionEvent

def map_quote(data: dict[str, Any]) -> Quote:
    raw_status = data.get("market_status", data.get("marketStatus", "open"))
    valid_statuses = {"open", "closed", "pre-market", "after-hours", "unknown"}
    status = raw_status if raw_status in valid_statuses else "open"
    return Quote(
        symbol=data.get("symbol", ""),
        price=float(data.get("price", 0.0)),
        change=float(data.get("change", 0.0)),
        changePercent=float(data.get("change_percent", data.get("changePercent", 0.0))),
        volume=int(data.get("volume", 0)),
        marketStatus=status,
        timestamp=str(data.get("timestamp", ""))
    )

def map_chart_point(data: dict[str, Any]) -> ChartPoint:
    return ChartPoint(
        timestamp=str(data.get("timestamp", "")),
        price=float(data.get("price", 0.0)),
        volume=float(data.get("volume", 0.0)),
        open=float(data.get("open", data.get("price", 0.0))),
        high=float(data.get("high", data.get("price", 0.0))),
        low=float(data.get("low", data.get("price", 0.0))),
        close=float(data.get("close", data.get("price", 0.0)))
    )

def map_portfolio(data: dict[str, Any]) -> Portfolio:
    return Portfolio(
        totalValue=float(data.get("total_value", data.get("totalValue", 0.0))),
        dailyPnl=float(data.get("daily_pnl", data.get("dailyPnl", 0.0))),
        dailyPnlPercent=float(data.get("daily_pnl_percent", data.get("dailyPnlPercent", 0.0))),
        totalReturn=float(data.get("total_return", data.get("totalReturn", 0.0))),
        totalReturnPercent=float(data.get("total_return_percent", data.get("totalReturnPercent", 0.0))),
        buyingPower=float(data.get("buying_power", data.get("buyingPower", 0.0))),
        invested=float(data.get("invested", 0.0)),
        openPositions=int(data.get("open_positions", data.get("openPositions", 0))),
        cash=float(data.get("cash", 0.0))
    )

def map_position(data: dict[str, Any]) -> Position:
    return Position(
        id=str(data.get("id", "")),
        symbol=str(data.get("symbol", "")),
        assetType=data.get("asset_type", data.get("assetType", "stock")),
        side=data.get("side", "buy"),
        quantity=float(data.get("quantity", 0.0)),
        averagePrice=float(data.get("average_price", data.get("averagePrice", 0.0))),
        currentPrice=float(data.get("current_price", data.get("currentPrice", 0.0))),
        marketValue=float(data.get("market_value", data.get("marketValue", 0.0))),
        pnl=float(data.get("pnl", 0.0)),
        pnlPercent=float(data.get("pnl_percent", data.get("pnlPercent", 0.0))),
        delta=float(data["delta"]) if data.get("delta") is not None else None,
        gamma=float(data["gamma"]) if data.get("gamma") is not None else None,
        theta=float(data["theta"]) if data.get("theta") is not None else None,
        vega=float(data["vega"]) if data.get("vega") is not None else None,
        impliedVolatility=float(data["implied_volatility"]) if data.get("implied_volatility") is not None else (float(data["impliedVolatility"]) if data.get("impliedVolatility") is not None else None),
        status=data.get("status", "open")
    )

def map_trade(data: dict[str, Any]) -> Trade:
    return Trade(
        id=str(data.get("id", "")),
        symbol=str(data.get("symbol", "")),
        assetType=data.get("asset_type", data.get("assetType", "stock")),
        side=data.get("side", "buy"),
        quantity=float(data.get("quantity", 0.0)),
        price=float(data.get("price", 0.0)),
        pnl=float(data["pnl"]) if data.get("pnl") is not None else None,
        status=data.get("status", "filled"),
        timestamp=str(data.get("timestamp", ""))
    )

def map_option_contract(data: dict[str, Any]) -> OptionContract:
    return OptionContract(
        symbol=str(data.get("symbol", "")),
        contractSymbol=str(data.get("contract_symbol", data.get("contractSymbol", ""))),
        strike=float(data.get("strike", 0.0)),
        expiry=str(data.get("expiry", "")),
        type=data.get("type", "call"),
        bid=float(data.get("bid", 0.0)),
        ask=float(data.get("ask", 0.0)),
        last=float(data.get("last", 0.0)),
        volume=int(data.get("volume", 0)),
        openInterest=int(data.get("open_interest", data.get("openInterest", 0))),
        impliedVolatility=float(data.get("implied_volatility", data.get("impliedVolatility", 0.0))),
        delta=float(data.get("delta", 0.0)),
        gamma=float(data.get("gamma", 0.0)),
        theta=float(data.get("theta", 0.0)),
        vega=float(data.get("vega", 0.0))
    )

def map_option_chain(data: dict[str, Any]) -> OptionChain:
    return OptionChain(
        symbol=str(data.get("symbol", "")),
        underlyingPrice=float(data.get("underlying_price", data.get("underlyingPrice", 0.0))),
        expiry=str(data.get("expiry", "")),
        calls=[map_option_contract(c) for c in data.get("calls", [])],
        puts=[map_option_contract(p) for p in data.get("puts", [])],
        timestamp=str(data.get("timestamp", ""))
    )

def map_agent_signal(data: dict[str, Any] | None) -> AgentSignal | None:
    if not data:
        return None
    return AgentSignal(
        symbol=str(data.get("symbol", "")),
        action=data.get("action", "hold"),
        contract=data.get("contract"),
        strike=float(data["strike"]) if data.get("strike") is not None else None,
        expiry=data.get("expiry"),
        impliedVolatility=float(data["implied_volatility"]) if data.get("implied_volatility") is not None else (float(data["impliedVolatility"]) if data.get("impliedVolatility") is not None else None),
        expectedRealizedVolatility=float(data["expected_realized_volatility"]) if data.get("expected_realized_volatility") is not None else (float(data["expectedRealizedVolatility"]) if data.get("expectedRealizedVolatility") is not None else None),
        edge=float(data.get("edge", 0.0)),
        confidence=float(data.get("confidence", 0.0)),
        suggestedSize=float(data.get("suggested_size", data.get("suggestedSize", 0.0))),
        factors=list(data.get("factors", []))
    )

def map_agent_risk(data: dict[str, Any]) -> AgentRisk:
    return AgentRisk(
        portfolioExposure=float(data.get("exposure_percent", data.get("portfolioExposure", 0.0))),
        dailyLoss=float(data.get("daily_loss", data.get("dailyLoss", 0.0))),
        dailyLossLimit=float(data.get("daily_loss_limit", data.get("dailyLossLimit", 0.0))),
        maxPositionRisk=float(data.get("max_position_risk", data.get("maxPositionRisk", 0.0))),
        portfolioDelta=float(data.get("portfolio_delta", data.get("portfolioDelta", 0.0))),
        portfolioVega=float(data.get("portfolio_vega", data.get("portfolioVega", 0.0))),
        concentration=data.get("concentration", "low"),
        status=data.get("status", "safe")
    )

def map_decision_event(data: dict[str, Any]) -> DecisionEvent:
    return DecisionEvent(
        id=str(data.get("id", "")),
        timestamp=str(data.get("timestamp", "")),
        title=str(data.get("title", "")),
        description=str(data.get("description", "")),
        status=data.get("status", "completed")
    )

def map_agent_state(data: dict[str, Any], events: list[dict[str, Any]] | None = None) -> AgentState:
    timeline_events: list[DecisionEvent] = []
    if events:
        timeline_events = [map_decision_event(ev) for ev in events]
    elif "timeline" in data and isinstance(data["timeline"], list):
        timeline_events = [map_decision_event(ev) for ev in data["timeline"]]

    return AgentState(
        status=data.get("status", "active"),
        regime=data.get("regime", "neutral"),
        confidence=float(data.get("confidence", 0.0)),
        riskLevel=data.get("risk_level", data.get("riskLevel", "moderate")),
        latestSignal=map_agent_signal(data.get("latest_signal", data.get("latestSignal"))),
        risk=map_agent_risk(data.get("risk", {})),
        timeline=timeline_events,
        lastDecision=str(data.get("last_decision", data.get("lastDecision", "No recent decision")))
    )

def map_order_response(data: dict[str, Any]) -> OrderResponse:
    raw_price = data.get("price")
    price_val = float(raw_price) if raw_price is not None else 0.0

    raw_status = str(data.get("status", "pending")).lower()
    if "fill" in raw_status:
        status_val = "filled"
    elif "reject" in raw_status or "cancel" in raw_status:
        status_val = "rejected"
    else:
        status_val = "pending"

    return OrderResponse(
        orderId=str(data.get("order_id", data.get("orderId", ""))),
        symbol=str(data.get("symbol", "")),
        side=data.get("side", "buy"),
        quantity=float(data.get("quantity", 0.0)),
        orderType=data.get("order_type", data.get("orderType", "market")),
        timeInForce=data.get("time_in_force", data.get("timeInForce", "day")),
        price=price_val,
        status=status_val,
        timestamp=str(data.get("timestamp", "")),
        message=str(data.get("message", "Order processed"))
    )

def map_agent_decision_event(data: dict[str, Any]) -> AgentDecisionEvent:
    return AgentDecisionEvent(
        id=str(data.get("id", "")),
        timestamp=str(data.get("timestamp", "")),
        category=data.get("category", "system"),
        title=str(data.get("title", "")),
        description=str(data.get("description", "")),
        action=data.get("action"),
        status=data.get("status", "completed"),
        confidence=float(data["confidence"]) if data.get("confidence") is not None else None,
        symbol=data.get("symbol"),
        contract=data.get("contract"),
        metadata=dict(data.get("metadata", {}))
    )

def map_agent_decision(data: dict[str, Any]) -> AgentDecision:
    return AgentDecision(
        id=str(data.get("id", "")),
        timestamp=str(data.get("timestamp", "")),
        symbol=str(data.get("symbol", "")),
        action=data.get("action", "hold"),
        contract=data.get("contract"),
        strategy=data.get("strategy"),
        confidence=float(data.get("confidence", 0.0)),
        rationale=str(data.get("rationale", "")),
        expectedEdge=float(data["expected_edge"]) if data.get("expected_edge") is not None else (float(data["expectedEdge"]) if data.get("expectedEdge") is not None else None),
        riskScore=float(data["risk_score"]) if data.get("risk_score") is not None else (float(data["riskScore"]) if data.get("riskScore") is not None else None),
        suggestedSize=float(data["suggested_size"]) if data.get("suggested_size") is not None else (float(data["suggestedSize"]) if data.get("suggestedSize") is not None else None)
    )

def map_execution_event(data: dict[str, Any]) -> ExecutionEvent:
    return ExecutionEvent(
        id=str(data.get("id", "")),
        timestamp=str(data.get("timestamp", "")),
        orderId=str(data.get("order_id", data.get("orderId", ""))),
        symbol=str(data.get("symbol", "")),
        action=data.get("action", "buy"),
        quantity=float(data.get("quantity", 0.0)),
        price=float(data["price"]) if data.get("price") is not None else None,
        status=data.get("status", "submitted"),
        message=str(data.get("message", ""))
    )
