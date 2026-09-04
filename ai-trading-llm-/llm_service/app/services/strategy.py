from __future__ import annotations

from app.models.contracts import OptionChain, StrategyCandidate


class StrategyEngine:
    """Deterministic candidate generator; the LLM ranks/explains candidates."""

    def generate(self, chain: OptionChain) -> list[StrategyCandidate]:
        candidates: list[StrategyCandidate] = []
        calls = sorted(chain.calls, key=lambda x: abs(x.strike - chain.underlying_price))
        puts = sorted(chain.puts, key=lambda x: abs(x.strike - chain.underlying_price))

        if calls:
            c = calls[0]
            spread = next((x for x in calls[1:] if x.strike > c.strike), None)
            if spread:
                debit = max(0.0, c.ask - spread.bid)
                width = spread.strike - c.strike
                max_profit = max(0.0, width - debit)
                candidates.append(
                    StrategyCandidate(
                        name="Bull Call Spread", contract=f"{c.contract_symbol}|{spread.contract_symbol}",
                        rationale="Defined-risk bullish structure with capped loss and profit.",
                        max_loss=debit * 100, capital_required=debit * 100, score=max_profit / max(debit, 0.01)
                    )
                )

        if puts:
            p = puts[0]
            spread = next((x for x in puts[1:] if x.strike < p.strike), None)
            if spread:
                debit = max(0.0, p.ask - spread.bid)
                width = p.strike - spread.strike
                max_profit = max(0.0, width - debit)
                candidates.append(
                    StrategyCandidate(
                        name="Bear Put Spread", contract=f"{p.contract_symbol}|{spread.contract_symbol}",
                        rationale="Defined-risk bearish structure with capped loss and profit.",
                        max_loss=debit * 100, capital_required=debit * 100, score=max_profit / max(debit, 0.01)
                    )
                )
        return sorted(candidates, key=lambda x: x.score, reverse=True)
