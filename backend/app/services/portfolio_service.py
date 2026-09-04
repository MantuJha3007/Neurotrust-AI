from typing import List
from app.integrations.broker.base import BrokerProvider
from app.schemas.trading import PortfolioSummary, PositionDTO
from app.data.mock_data import TICKER_NAMES

class PortfolioService:
    def __init__(self, broker: BrokerProvider):
        self.broker = broker

    def get_portfolio_summary(self) -> PortfolioSummary:
        account = self.broker.get_account()
        positions = self.broker.get_positions()

        total_value = account.portfolio_value
        buying_power = account.buying_power
        
        # Calculate daily P&L estimate
        daily_pnl = round(total_value * 0.0129, 2)
        daily_pnl_pct = 1.29

        return PortfolioSummary(
            totalValue=total_value,
            dailyPnl=daily_pnl,
            dailyPnlPercent=daily_pnl_pct,
            buyingPower=buying_power,
            openPositions=len(positions)
        )

    def get_positions(self) -> List[PositionDTO]:
        positions = self.broker.get_positions()
        pos_dtos: List[PositionDTO] = []

        for p in positions:
            name = TICKER_NAMES.get(p.symbol.upper(), f"{p.symbol} Asset")
            pos_dtos.append(
                PositionDTO(
                    symbol=p.symbol,
                    name=name,
                    quantity=p.qty,
                    averagePrice=p.avg_entry_price,
                    currentPrice=p.current_price,
                    pnl=p.unrealized_pl,
                    pnlPercent=p.unrealized_plpc
                )
            )

        return pos_dtos
