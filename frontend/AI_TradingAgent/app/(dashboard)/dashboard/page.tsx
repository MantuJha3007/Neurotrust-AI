"use client";

import { AgentStatus } from "@/components/agent/agent-status";
import { SignalCard } from "@/components/agent/signal-card";
import { DecisionTimeline } from "@/components/agent/decision-timeline";
import { RiskPanel } from "@/components/agent/risk-panel";
import { PnlCard } from "@/components/dashboard/pnl-card";
import { PortfolioCard } from "@/components/dashboard/portfolio-card";
import { ExecutionLog } from "@/components/execution/execution-log";
import { OrderStatusStream } from "@/components/execution/order-status-stream";
import { PositionsTable } from "@/components/trading/positions-table";
import { TradeChart } from "@/components/trading/trade-chart";
import { CardSkeleton } from "@/components/loading/card-skeleton";
import { ChartSkeleton } from "@/components/loading/chart-skeleton";
import { TableSkeleton } from "@/components/loading/table-skeleton";
import { ErrorState } from "@/components/states/error-state";

import { useAgent } from "@/hooks/use-agent";
import { useMarketData } from "@/hooks/use-market-data";
import { usePortfolioData } from "@/hooks/use-portfolio";

function getRiskScore(
  riskLevel:
    | "low"
    | "moderate"
    | "high"
    | "critical",
): number {
  switch (riskLevel) {
    case "low":
      return 20;
    case "moderate":
      return 45;
    case "high":
      return 70;
    case "critical":
      return 90;
    default:
      return 50;
  }
}

export default function DashboardPage() {
  const portfolioQuery =
    usePortfolioData();

  const marketQuery =
    useMarketData("SPY", "1D");

  const agentQuery = useAgent();

  const isLoading =
    portfolioQuery.isLoading ||
    marketQuery.isLoading ||
    agentQuery.isLoading;

  if (isLoading) {
    return (
      <main className="space-y-5">
        <div className="space-y-2">
          <div className="h-3 w-36 animate-pulse rounded bg-slate-800" />
          <div className="h-6 w-72 animate-pulse rounded bg-slate-800" />
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

        <div className="grid gap-4 lg:grid-cols-3">
          <CardSkeleton
            lines={7}
            className="min-h-[360px]"
          />

          <CardSkeleton
            lines={7}
            className="min-h-[360px]"
          />

          <CardSkeleton
            lines={7}
            className="min-h-[360px]"
          />
        </div>

        <ChartSkeleton className="min-h-[330px]" />

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
    agentQuery.error ??
    null;

  if (firstError) {
    return (
      <main className="space-y-5">
        <ErrorState
          title="Dashboard unavailable"
          message={
            firstError instanceof Error
              ? firstError.message
              : "Unable to load dashboard data."
          }
          onRetry={() => {
            void Promise.all([
              portfolioQuery.refetch(),
              marketQuery.refetch(),
              agentQuery.refetch(),
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

  const agent =
    agentQuery.agent;

  if (!portfolio || !agent) {
    return (
      <main className="space-y-5">
        <ErrorState
          title="Dashboard data unavailable"
          message="The API returned an incomplete dashboard response."
          onRetry={() => {
            void Promise.all([
              portfolioQuery.refetch(),
              agentQuery.refetch(),
            ]);
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

  const signal =
    agent.latestSignal;

  const riskScore = getRiskScore(
    agent.riskLevel,
  );

  const isAgentRunning =
    agent.status === "active";

  const decisionEvents =
    agent.timeline.map((event) => ({
      id: event.id,
      timestamp: event.timestamp,
      title: event.title,
      description: event.description,
      status: event.status,
    }));

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isAgentRunning
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />

            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                isAgentRunning
                  ? "text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              {isAgentRunning
                ? "Trading Session Active"
                : "Agent Paused"}
            </span>
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
            Autonomous Trading Dashboard
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Portfolio, market intelligence, AI decisions
            and execution activity in one view.
          </p>
        </div>

        <div className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
          PAPER TRADING · US EQUITIES
        </div>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <AgentStatus
          running={isAgentRunning}
          connected={!agentQuery.isError}
          mode="paper"
          confidence={agent.confidence}
          strategy={
            signal
              ? signal.contract
              : "No active strategy"
          }
        />

        <SignalCard
          symbol={
            signal?.symbol ?? "—"
          }
          action={
            signal
              ? signal.action === "buy"
                ? "BUY"
                : "SELL"
              : "HOLD"
          }
          confidence={
            signal?.confidence ??
            agent.confidence
          }
          signal={
            signal
              ? signal.factors[0] ??
                "Active trading signal"
              : "No active signal"
          }
          rationale={
            signal
              ? signal.factors.join(" • ")
              : "The agent has not returned an active trading signal."
          }
          expectedEdge={
            signal?.edge ?? 0
          }
        />

        <RiskPanel
          riskScore={riskScore}
          portfolioDelta={
            agent.risk.portfolioDelta
          }
          portfolioGamma={null}
          portfolioTheta={null}
          portfolioVega={
            agent.risk.portfolioVega
          }
          maxDrawdown={null}
          exposurePercent={
            agent.risk.portfolioExposure
          }
        />
      </div>

      {chartData.length === 0 ? (
        <TradeChart
          title="Market Performance"
          symbol="SPY"
          data={[]}
        />
      ) : (
        <TradeChart
          title="Market Performance"
          symbol="SPY"
          data={chartData}
        />
      )}

      <PositionsTable
        positions={positions}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DecisionTimeline
          events={decisionEvents}
        />

        <OrderStatusStream />
      </div>

      <ExecutionLog />
    </main>
  );
}