from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from alpaca.data.enums import DataFeed
from alpaca.data.historical import (
    OptionHistoricalDataClient,
    StockHistoricalDataClient,
)
from alpaca.data.requests import (
    OptionChainRequest,
    StockBarsRequest,
    StockLatestQuoteRequest,
)
from alpaca.data.timeframe import TimeFrame
from alpaca.trading.client import TradingClient
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.trading.requests import LimitOrderRequest, MarketOrderRequest

from app.core.config import Settings
from app.core.errors import ConfigurationError, ExternalServiceError
from app.models.contracts import (
    ChartPoint,
    OptionChain,
    OptionContract,
    OrderRequest,
    OrderResponse,
    Portfolio,
    Position,
    Quote,
)

logger = logging.getLogger(__name__)


class AlpacaService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

        if not settings.alpaca_configured:
            self.stock_client = None
            self.option_client = None
            self.trading_client = None
        else:
            key = settings.alpaca_api_key.get_secret_value()
            secret = settings.alpaca_secret_key.get_secret_value()

            self.stock_client = StockHistoricalDataClient(key, secret)
            self.option_client = OptionHistoricalDataClient(key, secret)
            self.trading_client = TradingClient(
                key,
                secret,
                paper=settings.alpaca_paper,
            )

    def _require(self) -> None:
        if not self.settings.alpaca_configured:
            raise ConfigurationError(
                "ALPACA_API_KEY and ALPACA_SECRET_KEY are required"
            )

    async def quote(self, symbol: str) -> Quote:
        self._require()

        normalized_symbol = symbol.strip().upper()

        try:
            response = await asyncio.to_thread(
                self.stock_client.get_stock_latest_quote,
                StockLatestQuoteRequest(
                    symbol_or_symbols=normalized_symbol,
                ),
            )

            quote = response[normalized_symbol]

            bid = float(quote.bid_price or 0)
            ask = float(quote.ask_price or 0)

            if bid > 0 and ask > 0:
                price = (bid + ask) / 2
            else:
                price = max(bid, ask)

            return Quote(
                symbol=normalized_symbol,
                price=price,
                timestamp=datetime.now(timezone.utc).isoformat(),
            )

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to fetch quote for {normalized_symbol}: {exc}"
            ) from exc

    async def chart(
        self,
        symbol: str,
        timeframe: str = "1D",
    ) -> list[ChartPoint]:
        self._require()

        normalized_symbol = symbol.strip().upper()
        normalized_timeframe = timeframe.strip().upper()

        days_map = {
            "1D": 2,
            "5D": 7,
            "1W": 7,
            "1M": 35,
            "3M": 95,
            "6M": 190,
            "1Y": 370,
        }

        days = days_map.get(normalized_timeframe, 2)

        try:
            end = datetime.now(timezone.utc)
            start = end - timedelta(days=days)

            request = StockBarsRequest(
                symbol_or_symbols=normalized_symbol,
                timeframe=TimeFrame.Day,
                start=start,
                end=end,
                feed=DataFeed.IEX,
            )

            bars = await asyncio.to_thread(
                self.stock_client.get_stock_bars,
                request,
            )

            series = bars.data.get(normalized_symbol, [])

            return [
                ChartPoint(
                    timestamp=bar.timestamp.isoformat(),
                    price=float(bar.close),
                    volume=float(bar.volume),
                    open=float(bar.open),
                    high=float(bar.high),
                    low=float(bar.low),
                    close=float(bar.close),
                )
                for bar in series
            ]

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to fetch chart for {normalized_symbol}: {exc}"
            ) from exc

    async def account(self) -> Portfolio:
        self._require()

        try:
            account = await asyncio.to_thread(
                self.trading_client.get_account
            )

            positions = await asyncio.to_thread(
                self.trading_client.get_all_positions
            )

            equity = float(account.equity or 0)
            last_equity = float(account.last_equity or equity)

            daily_pnl = equity - last_equity
            buying_power = float(account.buying_power or 0)
            cash = float(account.cash or 0)

            invested = max(0.0, equity - cash)

            return Portfolio(
                total_value=equity,
                daily_pnl=daily_pnl,
                daily_pnl_percent=(
                    daily_pnl / last_equity * 100
                    if last_equity
                    else 0
                ),
                total_return=0.0,
                total_return_percent=0.0,
                buying_power=buying_power,
                invested=invested,
                open_positions=len(positions),
                cash=cash,
            )

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to fetch account: {exc}"
            ) from exc

    async def positions(self) -> list[Position]:
        self._require()

        try:
            positions = await asyncio.to_thread(
                self.trading_client.get_all_positions
            )

            result: list[Position] = []

            for position in positions:
                result.append(
                    Position(
                        id=str(position.asset_id),
                        symbol=str(position.symbol),
                        asset_type=str(
                            position.asset_class
                        ).lower(),
                        side=(
                            "buy"
                            if str(position.side)
                            .lower()
                            .endswith("long")
                            else "sell"
                        ),
                        quantity=float(position.qty or 0),
                        average_price=float(
                            position.avg_entry_price or 0
                        ),
                        current_price=float(
                            position.current_price or 0
                        ),
                        market_value=float(
                            position.market_value or 0
                        ),
                        pnl=float(
                            position.unrealized_pl or 0
                        ),
                        pnl_percent=float(
                            position.unrealized_plpc or 0
                        )
                        * 100,
                        status="open",
                    )
                )

            return result

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to fetch positions: {exc}"
            ) from exc

    async def option_chain(
        self,
        symbol: str,
        expiry: str | None = None,
    ) -> OptionChain:
        self._require()

        normalized_symbol = symbol.strip().upper()

        try:
            request = OptionChainRequest(
                underlying_symbol=normalized_symbol,
                expiration_date=expiry,
            )

            snapshots = await asyncio.to_thread(
                self.option_client.get_option_chain,
                request,
            )

            quote = await self.quote(normalized_symbol)

            calls: list[OptionContract] = []
            puts: list[OptionContract] = []

            for contract_symbol, snapshot in snapshots.items():
                latest_quote = snapshot.latest_quote
                latest_trade = snapshot.latest_trade
                greeks = snapshot.greeks

                parsed = self._parse_occ(contract_symbol)

                if parsed is None:
                    continue

                strike, expiration, option_type = parsed

                item = OptionContract(
                    symbol=normalized_symbol,
                    contract_symbol=contract_symbol,
                    strike=strike,
                    expiry=expiration,
                    type=option_type,
                    bid=float(
                        getattr(
                            latest_quote,
                            "bid_price",
                            0,
                        )
                        or 0
                    ),
                    ask=float(
                        getattr(
                            latest_quote,
                            "ask_price",
                            0,
                        )
                        or 0
                    ),
                    last=float(
                        getattr(
                            latest_trade,
                            "price",
                            0,
                        )
                        or 0
                    ),
                    volume=int(
                        getattr(
                            latest_trade,
                            "size",
                            0,
                        )
                        or 0
                    ),
                    open_interest=int(
                        getattr(
                            snapshot,
                            "open_interest",
                            0,
                        )
                        or 0
                    ),
                    implied_volatility=float(
                        getattr(
                            snapshot,
                            "implied_volatility",
                            0,
                        )
                        or 0
                    ),
                    delta=float(
                        getattr(
                            greeks,
                            "delta",
                            0,
                        )
                        or 0
                    ),
                    gamma=float(
                        getattr(
                            greeks,
                            "gamma",
                            0,
                        )
                        or 0
                    ),
                    theta=float(
                        getattr(
                            greeks,
                            "theta",
                            0,
                        )
                        or 0
                    ),
                    vega=float(
                        getattr(
                            greeks,
                            "vega",
                            0,
                        )
                        or 0
                    ),
                )

                if option_type == "call":
                    calls.append(item)
                else:
                    puts.append(item)

            expiries = [
                contract.expiry
                for contract in [*calls, *puts]
            ]

            selected_expiry = (
                expiry
                or (min(expiries) if expiries else "")
            )

            return OptionChain(
                symbol=normalized_symbol,
                underlying_price=quote.price,
                expiry=selected_expiry,
                calls=calls,
                puts=puts,
                timestamp=datetime.now(
                    timezone.utc
                ).isoformat(),
            )

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to fetch option chain for "
                f"{normalized_symbol}: {exc}"
            ) from exc

    async def submit_order(
        self,
        order: OrderRequest,
    ) -> OrderResponse:
        self._require()

        try:
            side = (
                OrderSide.BUY
                if order.side == "buy"
                else OrderSide.SELL
            )

            tif = (
                TimeInForce.DAY
                if order.time_in_force == "day"
                else TimeInForce.GTC
            )

            if order.order_type == "limit":
                request = LimitOrderRequest(
                    symbol=order.symbol,
                    qty=order.quantity,
                    side=side,
                    time_in_force=tif,
                    limit_price=order.price,
                )
            else:
                request = MarketOrderRequest(
                    symbol=order.symbol,
                    qty=order.quantity,
                    side=side,
                    time_in_force=tif,
                )

            result = await asyncio.to_thread(
                self.trading_client.submit_order,
                request,
            )

            status = str(result.status).lower()

            return OrderResponse(
                order_id=str(result.id),
                symbol=order.symbol,
                side=order.side,
                quantity=float(order.quantity),
                order_type=order.order_type,
                time_in_force=order.time_in_force,
                price=order.price,
                status=status,
                timestamp=datetime.now(
                    timezone.utc
                ).isoformat(),
                message="Order submitted to Alpaca",
            )

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to submit order: {exc}"
            ) from exc

    async def orders(self) -> list[dict[str, Any]]:
        self._require()

        try:
            orders = await asyncio.to_thread(
                self.trading_client.get_orders
            )

            return [
                {
                    "id": str(order.id),
                    "symbol": str(order.symbol),
                    "side": str(order.side),
                    "qty": float(order.qty or 0),
                    "price": float(
                        order.filled_avg_price
                        or order.limit_price
                        or 0
                    ),
                    "status": str(order.status),
                    "timestamp": (
                        order.submitted_at.isoformat()
                        if order.submitted_at
                        else datetime.now(
                            timezone.utc
                        ).isoformat()
                    ),
                }
                for order in orders
            ]

        except Exception as exc:
            raise ExternalServiceError(
                f"Unable to fetch orders: {exc}"
            ) from exc

    @staticmethod
    def _parse_occ(
        symbol: str,
    ) -> tuple[float, str, str] | None:
        compact = symbol.replace(" ", "")

        if len(compact) < 15:
            return None

        tail = compact[-15:]

        try:
            expiry_raw = tail[:6]
            option_type_raw = tail[6]

            if option_type_raw not in {"C", "P"}:
                return None

            option_type = (
                "call"
                if option_type_raw == "C"
                else "put"
            )

            strike = int(tail[7:]) / 1000

            expiry = datetime.strptime(
                expiry_raw,
                "%y%m%d",
            ).date().isoformat()

            return strike, expiry, option_type

        except (ValueError, IndexError):
            return None