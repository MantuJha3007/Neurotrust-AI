from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncIterator
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse

from app.core.errors import ConfigurationError, ExternalServiceError, ModelOutputError
from app.models.contracts import AgentDecision, AgentState, AnalyzeRequest, HealthResponse, OrderRequest, OrderResponse

router = APIRouter()


def services(request: Request):
    return request.app.state.services


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    s = services(request)
    return HealthResponse(
        status="ok", environment=s.settings.environment, groq_configured=s.settings.groq_configured,
        alpaca_configured=s.settings.alpaca_configured, agent_status=s.agent.status,
    )


@router.get("/market/quotes")
async def market_quotes(request: Request):
    s = services(request)
    symbols = [x.strip().upper() for x in s.settings.watchlist.split(",") if x.strip()]
    return [await s.alpaca.quote(symbol) for symbol in symbols]


@router.get("/market/chart/{symbol}")
async def market_chart(symbol: str, request: Request, timeframe: str = "1D"):
    try:
        return await services(request).alpaca.chart(symbol.upper(), timeframe)
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/portfolio")
async def portfolio(request: Request):
    try:
        return await services(request).alpaca.account()
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/portfolio/positions")
async def positions(request: Request):
    try:
        return await services(request).alpaca.positions()
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/trades")
async def trades(request: Request):
    try:
        orders = await services(request).alpaca.orders()
        return [
            {"id": o["id"], "symbol": o["symbol"], "assetType": "option" if len(o["symbol"]) > 10 else "stock",
             "side": o["side"], "quantity": o["qty"], "price": o["price"], "status": o["status"], "timestamp": o["timestamp"]}
            for o in orders
        ]
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/options/chain/{symbol}")
async def option_chain(symbol: str, request: Request, expiry: str | None = None):
    try:
        return await services(request).alpaca.option_chain(symbol.upper(), expiry)
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/options/contract/{contract_symbol}")
async def option_contract(contract_symbol: str, request: Request):
    symbol = "".join(ch for ch in contract_symbol if ch.isalpha())[:6]
    try:
        chain = await services(request).alpaca.option_chain(symbol)
        for item in [*chain.calls, *chain.puts]:
            if item.contract_symbol == contract_symbol:
                return {"contract": item, "timestamp": datetime.now(timezone.utc).isoformat()}
        raise HTTPException(status_code=404, detail="Option contract not found")
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


async def _build_context(request: Request, symbol: str):
    s = services(request)
    quote, chart, portfolio, positions = await asyncio.gather(
        s.alpaca.quote(symbol), s.alpaca.chart(symbol, "1M"), s.alpaca.account(), s.alpaca.positions()
    )
    chain = await s.alpaca.option_chain(symbol)
    provisional = __import__("app.models.contracts", fromlist=["AgentContext"]).AgentContext(
        symbol=symbol, quote=quote, chart=chart, portfolio=portfolio, positions=positions,
        option_chain=chain, risk=__import__("app.models.contracts", fromlist=["RiskSummary"]).RiskSummary(
            portfolio_delta=0, portfolio_gamma=0, portfolio_theta=0, portfolio_vega=0, exposure_percent=0,
            daily_loss=max(0, -portfolio.daily_pnl), daily_loss_limit=s.settings.agent_daily_loss_limit,
            max_position_risk=s.settings.agent_max_position_risk, risk_score=0, status="safe", concentration="low"
        ), timestamp=datetime.now(timezone.utc).isoformat()
    )
    provisional.risk = s.risk.evaluate_portfolio(provisional)
    return provisional


@router.post("/agent/analyze", response_model=AgentDecision)
async def analyze(body: AnalyzeRequest, request: Request):
    try:
        context = await _build_context(request, body.symbol)
        decision = await services(request).agent.analyze(context, execute=body.execute)
        services(request).agent.last_state = services(request).agent.state(context)
        services(request).agent.last_state = services(request).agent.last_state.model_copy(
            update={
                "latest_signal": __import__("app.models.contracts", fromlist=["AgentSignal"]).AgentSignal(
                    symbol=decision.symbol, action=decision.action.value if decision.action.value in {"buy", "sell", "hold", "reject"} else "reject",
                    contract=decision.contract, confidence=decision.confidence, suggested_size=decision.suggested_size or 0,
                    edge=decision.expected_edge or 0, factors=[decision.rationale],
                )
            }
        )
        return decision
    except (ConfigurationError, ExternalServiceError, ModelOutputError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.get("/agent/status", response_model=AgentState)
async def agent_status(request: Request):
    s = services(request)
    if s.agent.last_state:
        return s.agent.last_state
    try:
        context = await _build_context(request, "SPY")
        return s.agent.state(context)
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/agent/pause")
async def pause_agent(request: Request):
    services(request).agent.status = "paused"
    return {"status": "paused"}


@router.post("/agent/resume")
async def resume_agent(request: Request):
    services(request).agent.status = "active"
    return {"status": "active"}


@router.get("/agent/events")
async def agent_events(request: Request, limit: int = 50):
    return await services(request).events.history(limit)


@router.get("/agent/events/stream")
async def agent_event_stream(request: Request):
    s = services(request)

    async def stream() -> AsyncIterator[str]:
        history = await s.events.history(10)
        for event in reversed(history):
            yield f"data: {json.dumps(event.model_dump(mode='json'))}\n\n"
        async for event in s.events.subscribe():
            if await request.is_disconnected():
                break
            yield f"data: {json.dumps(event.model_dump(mode='json'))}\n\n"

    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@router.get("/execution/events")
async def execution_events(request: Request):
    rows = await services(request).events.history(100)
    return [x for x in rows if x.category.value == "execution"]


@router.post("/orders", response_model=OrderResponse)
async def create_order(body: OrderRequest, request: Request):
    s = services(request)
    try:
        if s.settings.alpaca_paper is False and s.settings.environment != "production":
            raise HTTPException(status_code=403, detail="Live trading requires production environment")
        positions = await s.alpaca.positions()
        portfolio = await s.alpaca.account()
        quote = await s.alpaca.quote(body.symbol)
        context = __import__("app.models.contracts", fromlist=["AgentContext"]).AgentContext(
            symbol=body.symbol, quote=quote, chart=[], portfolio=portfolio, positions=positions, option_chain=None,
            risk=__import__("app.models.contracts", fromlist=["RiskSummary"]).RiskSummary(
                portfolio_delta=0, portfolio_gamma=0, portfolio_theta=0, portfolio_vega=0,
                exposure_percent=0, daily_loss=max(0, -portfolio.daily_pnl), daily_loss_limit=s.settings.agent_daily_loss_limit,
                max_position_risk=s.settings.agent_max_position_risk, risk_score=0, status="safe", concentration="low"
            ), timestamp=datetime.now(timezone.utc).isoformat()
        )
        context.risk = s.risk.evaluate_portfolio(context)
        # Manual orders use the same deterministic portfolio gate as autonomous orders.
        proposed = __import__("app.models.contracts", fromlist=["LLMDecision"]).LLMDecision(
            action=body.side, symbol=body.symbol, contract=None, strategy="manual", confidence=100,
            rationale="Manual order submitted by authorized frontend request.", expected_edge=0, suggested_size=body.quantity,
            factors=["manual"], regime="manual"
        )
        check = s.risk.validate_trade(context, proposed)
        if not check.approved:
            raise HTTPException(status_code=409, detail={"message": "Order blocked by risk controls", "reasons": check.reasons})
        response = await s.alpaca.submit_order(body)
        await s.agent.emit("Order submitted", response.message, __import__("app.models.contracts", fromlist=["DecisionEventCategory"]).DecisionEventCategory.EXECUTION, __import__("app.models.contracts", fromlist=["DecisionEventStatus"]).DecisionEventStatus.COMPLETED, symbol=body.symbol, action=body.side)
        return response
    except HTTPException:
        raise
    except (ConfigurationError, ExternalServiceError) as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
