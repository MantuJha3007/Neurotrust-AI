"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TradeChartPoint {
  time: string;
  value: number;
}

interface TradeChartProps {
  data?: TradeChartPoint[];
  title?: string;
  symbol?: string;
}

function formatValue(
  value: number,
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TradeChart({
  data = [],
  title = "Portfolio Performance",
  symbol = "ACCOUNT",
}: TradeChartProps) {
  const firstValue =
    data[0]?.value ?? 0;

  const lastValue =
    data[data.length - 1]?.value ??
    firstValue;

  const change =
    lastValue - firstValue;

  const changePercent =
    firstValue !== 0
      ? (change / firstValue) * 100
      : 0;

  const isPositive = change >= 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/10">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-100">
              {title}
            </h2>

            <span className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-slate-500">
              {symbol}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-600">
            API-backed market series
          </p>
        </div>

        <div className="text-right">
          <div
            className={`font-mono text-sm font-semibold ${
              isPositive
                ? "text-emerald-400"
                : "text-red-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatValue(change)}
          </div>

          <div
            className={`mt-0.5 font-mono text-[10px] ${
              isPositive
                ? "text-emerald-500"
                : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-600">
            No chart data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 8,
                right: 8,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="portfolioAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#10b981"
                    stopOpacity={0.28}
                  />

                  <stop
                    offset="100%"
                    stopColor="#10b981"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#1e293b"
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#64748b",
                  fontSize: 10,
                }}
                minTickGap={24}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={58}
                tick={{
                  fill: "#64748b",
                  fontSize: 10,
                }}
                tickFormatter={(
                  value: number,
                ) =>
                  `$${Math.round(
                    value / 1000,
                  )}k`
                }
                domain={[
                  "auto",
                  "auto",
                ]}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    "#020617",
                  border:
                    "1px solid #1e293b",
                  borderRadius: "8px",
                  color: "#e2e8f0",
                  fontSize: "11px",
                }}
                labelStyle={{
                  color: "#64748b",
                  marginBottom: "4px",
                }}
                formatter={(value) => [
                  formatValue(
                    Number(value),
                  ),
                  "Value",
                ]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#portfolioAreaGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  strokeWidth: 0,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default TradeChart;