"use client";

import { ActionBadge } from "@/components/agent/action-badge";
import { AIDecisionStream } from "@/components/agent/ai-decision-stream";
import { AgentStatus } from "@/components/agent/agent-status";
import { ConfidenceMeter } from "@/components/agent/confidence-meter";
import { DecisionTimeline } from "@/components/agent/decision-timeline";
import { RiskPanel } from "@/components/agent/risk-panel";
import { SignalCard } from "@/components/agent/signal-card";
import { ExecutionLog } from "@/components/execution/execution-log";
import { OrderStatusStream } from "@/components/execution/order-status-stream";
import { AgentSkeleton } from "@/components/loading/agent-skeleton";
import { ErrorState } from "@/components/states/error-state";
import {
  useAgent,
  usePauseAgent,
  useResumeAgent,
} from "@/hooks/use-agent";

function getRiskScore(
  riskLevel: "low" | "moderate" | "high" | "critical",
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

export default function AgentPage() {
  const agentQuery = useAgent();

  const pauseMutation = usePauseAgent();
  const resumeMutation = useResumeAgent();

  if (agentQuery.isLoading) {
    return (
      <main className="space-y-5">
        <AgentSkeleton />
      </main>
    );
  }

  if (agentQuery.isError) {
    return (
      <main className="space-y-5">
        <ErrorState
          title="Agent unavailable"
          message={
            agentQuery.error instanceof Error
              ? agentQuery.error.message
              : "Unable to load agent state."
          }
          onRetry={() => {
            void agentQuery.refetch();
          }}
        />
      </main>
    );
  }

  const agent = agentQuery.agent;

  if (!agent) {
    return (
      <main className="space-y-5">
        <ErrorState
          title="Agent state unavailable"
          message="The API returned no agent state."
          onRetry={() => {
            void agentQuery.refetch();
          }}
        />
      </main>
    );
  }

  const signal = agent.latestSignal;

  const running = agent.status === "active";

  const mutationPending =
    pauseMutation.isPending || resumeMutation.isPending;

  const riskScore = getRiskScore(agent.riskLevel);

  const timeline = agent.timeline.map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    title: event.title,
    description: event.description,
    status: event.status,
  }));

  function handleToggle(): void {
    if (mutationPending) {
      return;
    }

    if (running) {
      pauseMutation.mutate();
      return;
    }

    resumeMutation.mutate();
  }

  const action =
    signal?.action === "buy"
      ? "buy"
      : signal?.action === "sell"
        ? "sell"
        : signal?.action === "hold"
          ? "hold"
          : "monitor";

  return (
    <main className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                running
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />

            <span
              className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                running
                  ? "text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              {running
                ? "Autonomous Intelligence Active"
                : "Autonomous Intelligence Paused"}
            </span>
          </div>

          <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-100">
            AI Trading Agent
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            Observe the agent&apos;s market analysis, confidence,
            strategy selection, risk validation and execution decisions.
          </p>
        </div>

        <ActionBadge action={action} />
      </div>

      <AgentStatus
        running={running}
        connected={!agentQuery.isError}
        mode="paper"
        confidence={agent.confidence}
        strategy={
          signal?.contract ?? "No active strategy"
        }
        onToggle={handleToggle}
      />

      {mutationPending ? (
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-xs text-sky-400">
          Updating agent state...
        </div>
      ) : null}

      {pauseMutation.isError ? (
        <ErrorState
          title="Unable to pause agent"
          message={
            pauseMutation.error instanceof Error
              ? pauseMutation.error.message
              : "The pause request failed."
          }
        />
      ) : null}

      {resumeMutation.isError ? (
        <ErrorState
          title="Unable to resume agent"
          message={
            resumeMutation.error instanceof Error
              ? resumeMutation.error.message
              : "The resume request failed."
          }
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <SignalCard
          symbol={signal?.symbol ?? "—"}
          action={
            signal
              ? signal.action === "buy"
                ? "BUY"
                : signal.action === "sell"
                  ? "SELL"
                  : "HOLD"
              : "HOLD"
          }
          confidence={
            signal?.confidence ?? agent.confidence
          }
          signal={
            signal?.factors[0] ?? "No active signal"
          }
          rationale={
            signal
              ? signal.factors.join(" • ")
              : "The agent has not returned an active trading signal."
          }
          expectedEdge={signal?.edge ?? 0}
        />

        <ConfidenceMeter
          confidence={agent.confidence}
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

      <AIDecisionStream />

      <DecisionTimeline
        events={timeline}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <OrderStatusStream />

        <ExecutionLog />
      </div>
    </main>
  );
}