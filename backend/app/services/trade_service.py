import uuid
from typing import List
from datetime import datetime
from app.schemas.trading import TradeDTO

class TradeService:
    def __init__(self):
        self._trades: List[TradeDTO] = [
            TradeDTO(
                id="TRD-001",
                symbol="NVDA",
                action="BUY",
                quantity=10,
                price=178.32,
                status="FILLED",
                timestamp="10:42:18"
            )
        ]

    def get_trades(self) -> List[TradeDTO]:
        return sorted(self._trades, key=lambda x: x.timestamp, reverse=True)

    def record_trade(self, symbol: str, action: str, quantity: int, price: float, status: str) -> TradeDTO:
        now_str = datetime.now().strftime("%H:%M:%S")
        trade_id = f"TRD-{len(self._trades) + 1:03d}"
        trade = TradeDTO(
            id=trade_id,
            symbol=symbol.upper(),
            action=action.upper(),
            quantity=quantity,
            price=price,
            status=status.upper(),
            timestamp=now_str
        )
        self._trades.append(trade)
        return trade

trade_service = TradeService()
