from fastapi import APIRouter, HTTPException
from app.clients.llm_client import llm_client
from app.schemas.portfolio import Trade
from app.schemas.mappers import map_trade

router = APIRouter(prefix="/api/trades", tags=["Trades"])

@router.get("", response_model=list[Trade])
async def get_trades():
    try:
        raw_trades = await llm_client.get_trades()
        return [map_trade(t) for t in raw_trades]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch trade history: {str(exc)}")
