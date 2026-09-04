"use client";

import { CardSkeleton } from "@/components/loading/card-skeleton";
import { ChartSkeleton } from "@/components/loading/chart-skeleton";
import { TableSkeleton } from "@/components/loading/table-skeleton";
import { ErrorState } from "@/components/states/error-state";
import { ExecutionLog } from "@/components/execution/execution-log";
import { OrderStatusStream } from "@/components/execution/order-status-stream";
import { OrderPanel } from "@/components/trading/order-panel";
import { PositionsTable } from "@/components/trading/positions-table";
import { TradeChart } from "@/components/trading/trade-chart";

import { useMarketData } from "@/hooks/use-market-data";
import { usePortfolioData } from "@/hooks/use-portfolio";

export default function TradesPage() {
  const portfolioQuery =
    usePortfolioData();

  const marketQuery =
    useMarketData("SPY", "1D");

  const isLoading =
    portfolioQuery.isLoading ||
    marketQuery.isLoading;

  if (isLoading) {
    return (
      <main className="space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
          <div className="h-6 w-56 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-96 max-w-full animate-pulse rounded bg-slate-900" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <CardSkeleton
            lines={10}
            className="min-h-[520px]"
          />

          <ChartSkeleton className="min-h-[520px]" />
        </div>

        <TableSkeleton
          rows={5}
          columns={8}
          className="min-h-[300px]"
        />
      </main>
    );
  }

  const firstError =
    portfolioQuery.error ??
    marketQuery.error ??
    null;

  if (firstError) {
    return (
      <main className="space-y-5">
        <ErrorState
          title="Trading workspace unavailable"
          message={
            firstError instanceof Error
              ? firstError.message
              : "Unable to load trading data."
          }
          onRetry={() => {
            void Promise.all([
              portfolioQuery.refetch(),
              marketQuery.refetch(),
            ]);
          }}
        />
      </main>
    );
  }

  const positions =
    portfolioQuery.positions;

  const chartData =
    marketQuery.chart.map((point) => ({
      time: point.timestamp,
      value: point.price,
    }));

  return (
    <main className="space-y-5">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Trading
        </div>

        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
          Trade Execution
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Monitor open positions, submit orders and inspect execution activity.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <OrderPanel
          symbol="AAPL"
          contractSymbol="AAPL260918C00230000"
          defaultPrice={4.85}
          defaultTimeInForce="day"
        />

        <TradeChart
          title="Market Reference"
          symbol="SPY"
          data={chartData}
        />
      </div>

      <PositionsTable
        positions={positions}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <OrderStatusStream />

        <ExecutionLog />
      </div>
    </main>
  );
}