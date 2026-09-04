from fastapi import APIRouter, HTTPException, Query
from app.clients.llm_client import llm_client
from app.schemas.market import Quote, ChartPoint
from app.schemas.mappers import map_quote, map_chart_point

router = APIRouter(prefix="/api/market", tags=["Market Data"])

@router.get("/quotes", response_model=list[Quote])
async def get_market_quotes():
    try:
        raw_quotes = await llm_client.get_market_quotes()
        return [map_quote(q) for q in raw_quotes]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch market quotes: {str(exc)}")

@router.get("/chart/{symbol}", response_model=list[ChartPoint])
async def get_market_chart(
    symbol: str,
    timeframe: str = Query(default="1D", description="Timeframe: 1D, 5D, 1M, 3M, 6M, 1Y")
):
    try:
        raw_chart = await llm_client.get_market_chart(symbol.upper(), timeframe=timeframe)
        return [map_chart_point(p) for p in raw_chart]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch market chart for {symbol}: {str(exc)}")
