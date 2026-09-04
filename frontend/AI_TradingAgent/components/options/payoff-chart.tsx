"use client";

import {
  useMemo,
} from "react";

import {
  calculatePayoff,
} from "@/lib/options/strategy-normalizer";

import {
  useOptionsStore,
} from "@/stores/options-store";

interface PayoffChartProps {
  width?: number;
  height?: number;
}

export function PayoffChart({
  width = 760,
  height = 320,
}: PayoffChartProps) {
  const legs =
    useOptionsStore(
      (state) =>
        state.strategyLegs,
    );

  const selectedContract =
    useOptionsStore(
      (state) =>
        state.selectedContract,
    );

  const data =
    useMemo(() => {
      if (
        legs.length === 0
      ) {
        return [];
      }

      const center =
        selectedContract
          ?.strike ?? 250;

      const minimum =
        Math.max(
          1,
          center - 40,
        );

      const maximum =
        center + 40;

      const points = 81;

      return Array.from(
        {
          length: points,
        },
        (_, index) => {
          const price =
            minimum +
            ((maximum -
              minimum) *
              index) /
              (points - 1);

          return {
            price,
            pnl: calculatePayoff(
              legs,
              price,
            ),
          };
        },
      );
    }, [
      legs,
      selectedContract,
    ]);

  if (legs.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
        <div className="text-center">
          <p className="text-sm font-medium text-slate-400">
            Payoff chart unavailable
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Add at least one option leg
            to visualize strategy payoff.
          </p>
        </div>
      </div>
    );
  }

  const maxAbsPnl =
    Math.max(
      1,
      ...data.map(
        (point) =>
          Math.abs(
            point.pnl,
          ),
      ),
    );

  const zeroY =
    height / 2;

  const chartPadding = {
    top: 24,
    right: 24,
    bottom: 40,
    left: 60,
  };

  const chartWidth =
    width -
    chartPadding.left -
    chartPadding.right;

  const chartHeight =
    height -
    chartPadding.top -
    chartPadding.bottom;

  const points = data
    .map(
      (
        point,
        index,
      ) => {
        const x =
          chartPadding.left +
          (index /
            Math.max(
              1,
              data.length -
                1,
            )) *
            chartWidth;

        const normalized =
          point.pnl /
          maxAbsPnl;

        const y =
          zeroY -
          normalized *
            (chartHeight /
              2 -
              8);

        return `${x},${y}`;
      },
    )
    .join(" ");

  const zeroLineY =
    zeroY;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-100">
          Strategy Payoff
        </h2>

        <p className="mt-1 text-[10px] text-slate-600">
          Estimated expiration payoff across
          underlying prices.
        </p>
      </div>

      <div className="overflow-x-auto p-4">
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Options strategy payoff chart"
          className="min-w-[680px]"
        >
          <line
            x1={
              chartPadding.left
            }
            y1={
              chartPadding.top
            }
            x2={
              chartPadding.left
            }
            y2={
              height -
              chartPadding.bottom
            }
            stroke="currentColor"
            className="text-slate-800"
          />

          <line
            x1={
              chartPadding.left
            }
            y1={
              zeroLineY
            }
            x2={
              width -
              chartPadding.right
            }
            y2={
              zeroLineY
            }
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-slate-700"
          />

          <line
            x1={
              chartPadding.left
            }
            y1={
              chartPadding.top
            }
            x2={
              width -
              chartPadding.right
            }
            y2={
              chartPadding.top
            }
            stroke="currentColor"
            strokeDasharray="2 6"
            className="text-slate-900"
          />

          <line
            x1={
              chartPadding.left
            }
            y1={
              height -
              chartPadding.bottom
            }
            x2={
              width -
              chartPadding.right
            }
            y2={
              height -
              chartPadding.bottom
            }
            stroke="currentColor"
            className="text-slate-800"
          />

          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-emerald-400"
          />

          <text
            x="12"
            y={
              chartPadding.top +
              4
            }
            fill="currentColor"
            className="fill-slate-600 text-[9px]"
          >
            +PnL
          </text>

          <text
            x="12"
            y={
              zeroLineY + 4
            }
            fill="currentColor"
            className="fill-slate-600 text-[9px]"
          >
            $0
          </text>

          <text
            x="12"
            y={
              height -
              chartPadding.bottom
            }
            fill="currentColor"
            className="fill-slate-600 text-[9px]"
          >
            -PnL
          </text>

          <text
            x={
              chartPadding.left
            }
            y={
              height - 12
            }
            fill="currentColor"
            className="fill-slate-600 font-mono text-[9px]"
          >
            $
            {data[0].price.toFixed(
              0,
            )}
          </text>

          <text
            x={
              width -
              chartPadding.right
            }
            y={
              height - 12
            }
            textAnchor="end"
            fill="currentColor"
            className="fill-slate-600 font-mono text-[9px]"
          >
            $
            {data[
              data.length - 1
            ].price.toFixed(0)}
          </text>
        </svg>
      </div>
    </div>
  );
}