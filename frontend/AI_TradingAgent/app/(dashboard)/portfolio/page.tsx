"use client";

import { CardSkeleton } from "@/components/loading/card-skeleton";
import { ChartSkeleton } from "@/components/loading/chart-skeleton";
import { TableSkeleton } from "@/components/loading/table-skeleton";
import { RiskPanel } from "@/components/agent/risk-panel";
import { PnlCard } from "@/components/dashboard/pnl-card";
import { PortfolioCard } from "@/components/dashboard/portfolio-card";
import { PositionsTable } from "@/components/trading/positions-table";
import { TradeChart } from "@/components/trading/trade-chart";
import { ErrorState } from "@/components/states/error-state";

import { useMarketData } from "@/hooks/use-market-data";
import { usePortfolioData } from "@/hooks/use-portfolio";

function calculatePortfolioDelta(
  positions: ReturnType<
    typeof usePortfolioData
  >["positions"],
): number {
  return positions.reduce(
    (total, position) =>
      total + (position.delta ?? 0),
    0,
  );
}

function calculatePortfolioGamma(
  positions: ReturnType<
    typeof usePortfolioData
  >["positions"],
): number {
  return positions.reduce(
    (total, position) =>
      total + (position.gamma ?? 0),
    0,
  );
}

function calculatePortfolioTheta(
  positions: ReturnType<
    typeof usePortfolioData
  >["positions"],
): number {
  return positions.reduce(
    (total, position) =>
      total + (position.theta ?? 0),
    0,
  );
}

function calculatePortfolioVega(
  positions: ReturnType<
    typeof usePortfolioData
  >["positions"],
): number {
  return positions.reduce(
    (total, position) =>
      total + (position.vega ?? 0),
    0,
  );
}

export default function PortfolioPage() {
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
          <div className="h-3 w-24 animate-pulse rounded bg-slate-800" />
          <div className="h-6 w-64 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-96 max-w-full animate-pulse rounded bg-slate-900" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <CardSkeleton
            lines={6}
            className="min-h-[250px]"
          />

          <CardSkeleton
            lines={6}
            className="min-h-[250px]"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <ChartSkeleton className="min-h-[330px]" />

          <CardSkeleton
            lines={8}
            className="min-h-[500px]"
          />
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
          title="Portfolio unavailable"
          message={
            firstError instanceof Error
              ? firstError.message
              : "Unable to load portfolio data."
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

  const portfolio =
    portfolioQuery.portfolio;

  const positions =
    portfolioQuery.positions;

  if (!portfolio) {
    return (
      <main className="space-y-5">
        <ErrorState
          title="Portfolio data unavailable"
          message="The API returned no portfolio account data."
          onRetry={() => {
            void portfolioQuery.refetch();
          }}
        />
      </main>
    );
  }

  const chartData =
    marketQuery.chart.map((point) => ({
      time: point.timestamp,
      value: point.price,
    }));

  const exposurePercent =
    portfolio.totalValue > 0
      ? (portfolio.invested /
          portfolio.totalValue) *
        100
      : 0;

  const delta =
    calculatePortfolioDelta(
      positions,
    );

  const gamma =
    calculatePortfolioGamma(
      positions,
    );

  const theta =
    calculatePortfolioTheta(
      positions,
    );

  const vega =
    calculatePortfolioVega(
      positions,
    );

  const riskScore = Math.max(
    0,
    Math.min(
      100,
      exposurePercent,
    ),
  );

  return (
    <main className="space-y-5">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          Portfolio
        </div>

        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
          Portfolio Overview
        </h1>

        <p className="mt-1 text-xs text-slate-500">
          Account equity, open positions, performance and portfolio risk.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PortfolioCard
          totalValue={portfolio.totalValue}
          dayPnl={portfolio.dailyPnl}
          dayPnlPercent={
            portfolio.dailyPnlPercent
          }
          investedValue={
            portfolio.invested
          }
          cashBalance={portfolio.cash}
        />

        <PnlCard
          pnl={portfolio.dailyPnl}
          pnlPercent={
            portfolio.dailyPnlPercent
          }
          realizedPnl={null}
          unrealizedPnl={null}
          period="Today"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <TradeChart
          title="Market Reference"
          symbol="SPY"
          data={chartData}
        />

        <RiskPanel
          riskScore={riskScore}
          portfolioDelta={delta}
          portfolioGamma={gamma}
          portfolioTheta={theta}
          portfolioVega={vega}
          maxDrawdown={null}
          exposurePercent={exposurePercent}
        />
      </div>

      <PositionsTable
        positions={positions}
      />
    </main>
  );
}