from fastapi import APIRouter, HTTPException
from app.clients.llm_client import llm_client
from app.schemas.portfolio import Portfolio, Position
from app.schemas.mappers import map_portfolio, map_position

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])

@router.get("", response_model=Portfolio)
async def get_portfolio():
    try:
        raw_portfolio = await llm_client.get_portfolio()
        return map_portfolio(raw_portfolio)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch portfolio data: {str(exc)}")

@router.get("/positions", response_model=list[Position])
async def get_positions():
    try:
        raw_positions = await llm_client.get_positions()
        return [map_position(pos) for pos in raw_positions]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch portfolio positions: {str(exc)}")
