from typing import List, Optional, Dict
from datetime import datetime, timedelta
from app.integrations.market.base import MarketDataProvider
from app.execution.models import OptionContract, OptionType

class OptionsContractSelector:
    """
    Options Contract Retrieval & Liquidity Filtering Engine.
    Filters raw option chains based on strategy requirements, expiration window,
    spread width, open interest, and delta targets.
    """

    def __init__(self, market_provider: MarketDataProvider):
        self.market_provider = market_provider

    def select_candidate_contracts(
        self,
        symbol: str,
        direction: str = "BULLISH",  # BULLISH, BEARISH, NEUTRAL
        expiration_min_days: int = 7,
        expiration_max_days: int = 30,
        max_spread_pct: float = 0.15,  # Max 15% bid-ask spread
        min_open_interest: int = 100
    ) -> Dict[str, List[OptionContract]]:
        """
        Retrieves option chain for underlying symbol and splits into candidate Calls & Puts
        passing liquidity and spread filters.
        """
        raw_contracts = self.market_provider.get_option_contracts(
            symbol=symbol,
            expiration_min_days=expiration_min_days,
            expiration_max_days=expiration_max_days
        )

        filtered_calls: List[OptionContract] = []
        filtered_puts: List[OptionContract] = []

        for c in raw_contracts:
            # Spread Filter
            mid = (c.bid + c.ask) / 2.0
            if mid <= 0:
                continue
            spread_pct = (c.ask - c.bid) / mid
            if spread_pct > max_spread_pct:
                continue

            # Open Interest Filter
            if c.open_interest < min_open_interest:
                continue

            if c.option_type == OptionType.CALL:
                filtered_calls.append(c)
            else:
                filtered_puts.append(c)

        # Sort calls by strike ascending, puts by strike descending
        filtered_calls.sort(key=lambda x: x.strike)
        filtered_puts.sort(key=lambda x: x.strike, reverse=True)

        return {
            "calls": filtered_calls,
            "puts": filtered_puts
        }

    def get_optimal_single_leg(
        self,
        symbol: str,
        direction: str = "BULLISH",
        expiration_days: int = 14
    ) -> Optional[OptionContract]:
        candidates = self.select_candidate_contracts(
            symbol=symbol,
            direction=direction,
            expiration_min_days=expiration_days - 5,
            expiration_max_days=expiration_days + 5
        )

        target_list = candidates["calls"] if direction.upper() == "BULLISH" else candidates["puts"]
        if not target_list:
            return None

        # Pick near-the-money contract (closest to delta ~0.50)
        target_list.sort(key=lambda c: abs(abs(c.delta) - 0.50))
        return target_list[0]
