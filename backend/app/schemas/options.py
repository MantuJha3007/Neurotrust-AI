from typing import Literal
from pydantic import BaseModel

OptionType = Literal["call", "put"]

class OptionContract(BaseModel):
    symbol: str
    contractSymbol: str
    strike: float
    expiry: str
    type: OptionType
    bid: float
    ask: float
    last: float
    volume: int
    openInterest: int
    impliedVolatility: float
    delta: float
    gamma: float
    theta: float
    vega: float

class OptionChain(BaseModel):
    symbol: str
    underlyingPrice: float
    expiry: str
    calls: list[OptionContract]
    puts: list[OptionContract]
    timestamp: str

class OptionQuote(BaseModel):
    contract: OptionContract
    timestamp: str
