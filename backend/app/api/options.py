from fastapi import APIRouter, HTTPException, Query
from app.clients.llm_client import llm_client
from app.schemas.options import OptionChain, OptionQuote
from app.schemas.mappers import map_option_chain, map_option_contract

router = APIRouter(prefix="/api/options", tags=["Options"])

@router.get("/chain/{symbol}", response_model=OptionChain)
async def get_option_chain(
    symbol: str,
    expiry: str | None = Query(default=None, description="Expiration date YYYY-MM-DD")
):
    try:
        raw_chain = await llm_client.get_option_chain(symbol.upper(), expiry=expiry)
        return map_option_chain(raw_chain)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch option chain for {symbol}: {str(exc)}")

@router.get("/contract/{contract_symbol}", response_model=OptionQuote)
async def get_option_contract(contract_symbol: str):
    try:
        raw_contract = await llm_client.get_option_contract(contract_symbol)
        mapped_contract = map_option_contract(raw_contract.get("contract", raw_contract))
        timestamp = raw_contract.get("timestamp", "")
        return OptionQuote(contract=mapped_contract, timestamp=timestamp)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Failed to fetch option contract {contract_symbol}: {str(exc)}")
