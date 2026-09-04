"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";

import type { Position } from "@/types/trading";

interface PositionsTableProps {
  positions: Position[];
  onClose?: (position: Position) => void;
}

function formatCurrency(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(
  value: number,
): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatGreek(
  value: number | undefined,
): string {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return value >= 0
    ? `+${value.toFixed(3)}`
    : value.toFixed(3);
}

function formatExpiry(
  position: Position,
): string {
  const optionSymbol =
    position.symbol.toUpperCase();

  const match =
    optionSymbol.match(
      /(\d{4}-\d{2}-\d{2})$/,
    );

  if (!match) {
    return "N/A";
  }

  const date = new Date(
    `${match[1]}T00:00:00Z`,
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    },
  ).format(date);
}

function formatAssetType(
  assetType: Position["assetType"],
): string {
  return assetType.toUpperCase();
}

export function PositionsTable({
  positions,
  onClose,
}: PositionsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Open Positions
          </h2>

          <p className="mt-0.5 text-xs text-slate-500">
            Live account positions and exposure
          </p>
        </div>

        <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 font-mono text-[10px] text-slate-500">
          {positions.length} POSITIONS
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-left">
              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Position
              </th>

              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Asset
              </th>

              <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Side
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Qty
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Avg
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Mark
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                P&L
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Delta
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Gamma
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Theta
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Vega
              </th>

              <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {positions.length === 0 ? (
              <tr>
                <td
                  colSpan={12}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  No open positions.
                </td>
              </tr>
            ) : (
              positions.map((position) => {
                const isProfit =
                  position.pnl >= 0;
                const isBuy =
                  position.side === "buy";

                return (
                  <tr
                    key={position.id}
                    className="transition-colors hover:bg-slate-900/60"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold text-slate-100">
                        {position.symbol}
                      </div>

                      <div className="mt-1 font-mono text-[10px] text-slate-600">
                        {position.status.toUpperCase()}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded border border-slate-800 bg-slate-900 px-1.5 py-1 font-mono text-[9px] text-slate-500">
                        {formatAssetType(
                          position.assetType,
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase ${
                          isBuy
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}

                        {position.side}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-300">
                      {position.quantity}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-400">
                      {formatCurrency(
                        position.averagePrice,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-200">
                      {formatCurrency(
                        position.currentPrice,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          isProfit
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {position.pnl < 0
                          ? "-"
                          : "+"}
                        {formatCurrency(
                          Math.abs(
                            position.pnl,
                          ),
                        )}
                      </div>

                      <div
                        className={`mt-0.5 font-mono text-[10px] tabular-nums ${
                          isProfit
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {formatPercent(
                          position.pnlPercent,
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-300">
                      {formatGreek(
                        position.delta,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-400">
                      {formatGreek(
                        position.gamma,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-400">
                      {formatGreek(
                        position.theta,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs tabular-nums text-slate-400">
                      {formatGreek(
                        position.vega,
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          onClose?.(position)
                        }
                        aria-label={`Actions for ${position.symbol}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default PositionsTable;