"use client";

import {
  useMemo,
} from "react";

import {
  BriefcaseBusiness,
} from "lucide-react";

import type {
  OptionPosition,
} from "@/types/options";

interface MultiLegPositionManagerProps {
  positions?: OptionPosition[];
}

const mockOptionPositions: OptionPosition[] =
  [
    {
      id: "option-pos-1",
      strategyId:
        "strategy-aapl-call-spread",
      symbol: "AAPL",
      contractSymbol:
        "AAPL-2026-09-18-250-CALL",
      type: "call",
      side: "buy",
      quantity: 2,
      averagePrice: 5.44,
      currentPrice: 6.12,
      marketValue: 1_224,
      pnl: 136,
      pnlPercent: 12.5,
      delta: 0.48,
      gamma: 0.031,
      theta: -0.08,
      vega: 0.12,
      impliedVolatility: 0.314,
      expiry: "2026-09-18",
      strike: 250,
    },
    {
      id: "option-pos-2",
      strategyId:
        "strategy-aapl-call-spread",
      symbol: "AAPL",
      contractSymbol:
        "AAPL-2026-09-18-260-CALL",
      type: "call",
      side: "sell",
      quantity: 2,
      averagePrice: 2.64,
      currentPrice: 2.38,
      marketValue: 476,
      pnl: 52,
      pnlPercent: 9.85,
      delta: 0.29,
      gamma: 0.024,
      theta: -0.06,
      vega: 0.1,
      impliedVolatility: 0.301,
      expiry: "2026-09-18",
      strike: 260,
    },
  ];

export function MultiLegPositionManager({
  positions = mockOptionPositions,
}: MultiLegPositionManagerProps) {
  const grouped =
    useMemo(() => {
      const groups =
        new Map<
          string,
          OptionPosition[]
        >();

      positions.forEach(
        (position) => {
          const key =
            position.strategyId ??
            position.id;

          const current =
            groups.get(
              key,
            ) ?? [];

          groups.set(
            key,
            [
              ...current,
              position,
            ],
          );
        },
      );

      return Array.from(
        groups.entries(),
      );
    }, [positions]);

  if (
    positions.length === 0
  ) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950 p-8 text-center">
        <BriefcaseBusiness className="mx-auto h-5 w-5 text-slate-600" />

        <p className="mt-3 text-sm text-slate-400">
          No open option positions
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Multi-leg positions will appear
          here after execution.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100">
          Multi-Leg Positions
        </h2>

        <p className="mt-1 text-[10px] text-slate-600">
          Manage open option strategies and
          individual legs.
        </p>
      </div>

      <div className="divide-y divide-slate-800">
        {grouped.map(
          ([
            strategyId,
            strategyPositions,
          ]) => {
            const totalPnl =
              strategyPositions.reduce(
                (
                  total,
                  position,
                ) =>
                  total +
                  position.pnl,
                0,
              );

            const totalDelta =
              strategyPositions.reduce(
                (
                  total,
                  position,
                ) =>
                  total +
                  position.delta *
                    position.quantity *
                    (position.side ===
                    "buy"
                      ? 1
                      : -1),
                0,
              );

            return (
              <div
                key={strategyId}
                className="p-4"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-semibold text-slate-200">
                      {strategyId}
                    </div>

                    <div className="mt-1 text-[10px] text-slate-600">
                      {
                        strategyPositions.length
                      }{" "}
                      legs
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div>
                      <div className="text-right text-[8px] uppercase tracking-wider text-slate-600">
                        Delta
                      </div>

                      <div
                        className={`mt-1 text-right font-mono text-xs ${
                          totalDelta >=
                          0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {totalDelta.toFixed(
                          3,
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-right text-[8px] uppercase tracking-wider text-slate-600">
                        P&L
                      </div>

                      <div
                        className={`mt-1 text-right font-mono text-xs ${
                          totalPnl >=
                          0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {totalPnl >=
                        0
                          ? "+"
                          : ""}
                        $
                        {Math.abs(
                          totalPnl,
                        ).toFixed(
                          2,
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-left">
                        <th className="pb-2 pr-4 text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          Contract
                        </th>

                        <th className="pb-2 pr-4 text-right text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          Qty
                        </th>

                        <th className="pb-2 pr-4 text-right text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          Avg
                        </th>

                        <th className="pb-2 pr-4 text-right text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          Mark
                        </th>

                        <th className="pb-2 pr-4 text-right text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          Delta
                        </th>

                        <th className="pb-2 pr-4 text-right text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          Theta
                        </th>

                        <th className="pb-2 text-right text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                          P&L
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {strategyPositions.map(
                        (
                          position,
                        ) => (
                          <tr
                            key={
                              position.id
                            }
                            className="border-b border-slate-900 last:border-0"
                          >
                            <td className="py-3 pr-4">
                              <div className="font-mono text-[10px] font-medium text-slate-300">
                                {position.contractSymbol}
                              </div>

                              <div
                                className={`mt-1 text-[8px] font-semibold uppercase ${
                                  position.side ===
                                  "buy"
                                    ? "text-emerald-500"
                                    : "text-red-500"
                                }`}
                              >
                                {position.side}
                              </div>
                            </td>

                            <td className="py-3 pr-4 text-right font-mono text-[10px] text-slate-300">
                              {position.quantity}
                            </td>

                            <td className="py-3 pr-4 text-right font-mono text-[10px] text-slate-400">
                              $
                              {position.averagePrice.toFixed(
                                2,
                              )}
                            </td>

                            <td className="py-3 pr-4 text-right font-mono text-[10px] text-slate-300">
                              $
                              {position.currentPrice.toFixed(
                                2,
                              )}
                            </td>

                            <td className="py-3 pr-4 text-right font-mono text-[10px] text-slate-400">
                              {position.delta.toFixed(
                                3,
                              )}
                            </td>

                            <td className="py-3 pr-4 text-right font-mono text-[10px] text-red-400">
                              {position.theta.toFixed(
                                3,
                              )}
                            </td>

                            <td
                              className={`py-3 text-right font-mono text-[10px] font-semibold ${
                                position.pnl >=
                                0
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {position.pnl >=
                              0
                                ? "+"
                                : ""}
                              $
                              {Math.abs(
                                position.pnl,
                              ).toFixed(
                                2,
                              )}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}