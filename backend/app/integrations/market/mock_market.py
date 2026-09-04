import random
from typing import List, Dict
from datetime import datetime, timedelta
from app.integrations.market.base import MarketDataProvider
from app.execution.models import Quote, OptionContract, OptionType

class MockMarketProvider(MarketDataProvider):
    """
    Simulated Market Data Provider for Person 3 Day 1 & Person 2 API testing.
    Generates realistic stock quotes and option chains with strikes, IVs, and Greeks.
    """

    BASE_PRICES: Dict[str, float] = {
        "NVDA": 130.0,
        "AAPL": 225.0,
        "SPY": 560.0,
        "QQQ": 480.0,
        "TSLA": 210.0
    }

    def get_quote(self, symbol: str) -> Quote:
        base = self.BASE_PRICES.get(symbol.upper(), 150.0)
        variation = random.uniform(-0.015, 0.015) * base
        last = round(base + variation, 2)
        spread = round(max(0.01, last * 0.0005), 2)
        bid = round(last - spread / 2, 2)
        ask = round(last + spread / 2, 2)

        return Quote(
            symbol=symbol.upper(),
            bid=bid,
            ask=ask,
            last=last,
            bid_size=500,
            ask_size=500,
            timestamp=datetime.utcnow()
        )

    def get_option_contracts(
        self,
        symbol: str,
        expiration_min_days: int = 7,
        expiration_max_days: int = 30
    ) -> List[OptionContract]:
        quote = self.get_quote(symbol)
        spot = quote.last
        today = datetime.utcnow().date()

        expirations = [
            (today + timedelta(days=d)).strftime("%Y-%m-%d")
            for d in [10, 17, 24]
            if expiration_min_days <= d <= expiration_max_days
        ]

        if not expirations:
            expirations = [(today + timedelta(days=14)).strftime("%Y-%m-%d")]

        # Generate strikes around spot price (-10% to +10%)
        strike_step = 2.5 if spot < 200 else 5.0
        min_strike = round((spot * 0.90) / strike_step) * strike_step
        max_strike = round((spot * 1.10) / strike_step) * strike_step

        contracts: List[OptionContract] = []
        num_strikes = int((max_strike - min_strike) / strike_step) + 1

        for i in range(num_strikes):
            strike = min_strike + (i * strike_step)
            for exp in expirations:
                for opt_type in [OptionType.CALL, OptionType.PUT]:
                    # Estimate intrinsic and extrinsic value
                    if opt_type == OptionType.CALL:
                        intrinsic = max(0.0, spot - strike)
                        delta = max(0.05, min(0.95, 0.50 + (spot - strike) / (spot * 0.15)))
                    else:
                        intrinsic = max(0.0, strike - spot)
                        delta = max(-0.95, min(-0.05, -0.50 + (spot - strike) / (spot * 0.15)))

                    extrinsic = max(0.50, round((spot * 0.03) - (abs(spot - strike) * 0.05), 2))
                    last_price = round(intrinsic + extrinsic, 2)
                    bid = round(max(0.05, last_price - 0.10), 2)
                    ask = round(last_price + 0.10, 2)

                    ticker = f"{symbol.upper()}{exp.replace('-', '')[2:]}{'C' if opt_type == OptionType.CALL else 'P'}{int(strike*1000):08d}"

                    contracts.append(
                        OptionContract(
                            symbol=ticker,
                            underlying_symbol=symbol.upper(),
                            strike=strike,
                            expiration=exp,
                            option_type=opt_type,
                            bid=bid,
                            ask=ask,
                            last=last_price,
                            volume=random.randint(150, 4500),
                            open_interest=random.randint(500, 12000),
                            implied_volatility=round(random.uniform(0.22, 0.38), 4),
                            delta=round(delta, 3),
                            gamma=round(random.uniform(0.01, 0.06), 3),
                            vega=round(random.uniform(0.08, 0.25), 3),
                            theta=round(random.uniform(-0.12, -0.02), 3)
                        )
                    )

        return contracts
