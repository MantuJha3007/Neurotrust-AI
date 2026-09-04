"use client";

import {
  Activity,
  BrainCircuit,
  Radio,
} from "lucide-react";

import {
  useAgentStream,
} from "@/hooks/use-agent-stream";

import {
  ConfidenceMeter,
} from "@/components/agent/confidence-meter";

import {
  ActionBadge,
} from "@/components/agent/action-badge";

import {
  DecisionEvent,
} from "@/components/agent/decision-event";

import {
  AgentSkeleton,
} from "@/components/loading/agent-skeleton";

import {
  ErrorState,
} from "@/components/states/error-state";

import type {
  AgentDecision,
} from "@/types/agent";

interface AIDecisionStreamProps {
  className?: string;
}

export function AIDecisionStream({
  className = "",
}: AIDecisionStreamProps) {
  const stream =
    useAgentStream();

  if (
    !stream.connected &&
    !stream.latestDecision
  ) {
    return (
      <AgentSkeleton />
    );
  }

  if (
    stream.events.length ===
      0 &&
    !stream.latestDecision
  ) {
    return (
      <ErrorState
        title="AI decision stream unavailable"
        message="The autonomous decision engine has not produced any events yet."
      />
    );
  }

  return (
    <div
      className={`space-y-4 ${className}`}
    >
      <div className="rounded-xl border border-slate-800 bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
              <BrainCircuit
                className="h-4 w-4 text-violet-400"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                AI Decision Stream
              </h2>

              <p className="mt-1 text-[10px] text-slate-600">
                Autonomous market-to-action reasoning
                pipeline.
              </p>
            </div>
          </div>

          <StreamStatus
            connected={
              stream.connected
            }
            streaming={
              stream.streaming
            }
          />
        </div>

        {stream.latestDecision ? (
          <LatestDecision
            decision={
              stream.latestDecision
            }
          />
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity
              className="h-4 w-4 text-slate-500"
              aria-hidden="true"
            />

            <h2 className="text-sm font-semibold text-slate-200">
              Decision Trace
            </h2>
          </div>

          <span className="font-mono text-[9px] text-slate-700">
            {stream.events.length} events
          </span>
        </div>

        <div className="p-4">
          {stream.events.map(
            (event, index) => (
              <DecisionEvent
                key={event.id}
                event={event}
                isLast={
                  index ===
                  stream.events.length -
                    1
                }
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function StreamStatus({
  connected,
  streaming,
}: {
  connected: boolean;
  streaming: boolean;
}) {
  const active =
    connected &&
    streaming;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider ${
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-slate-700 bg-slate-900 text-slate-500"
      }`}
    >
      <Radio
        className={`h-3 w-3 ${
          active
            ? "animate-pulse"
            : ""
        }`}
        aria-hidden="true"
      />

      {active
        ? "Live"
        : "Disconnected"}
    </div>
  );
}

function LatestDecision({
  decision,
}: {
  decision: AgentDecision;
}) {
  return (
    <div className="p-4">
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                Latest Autonomous Decision
              </span>

              <ActionBadge
                action={
                  decision.action
                }
              />
            </div>

            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="font-mono text-lg font-bold text-slate-100">
                {decision.symbol}
              </span>

              {decision.contract ? (
                <span className="font-mono text-xs text-slate-400">
                  {decision.contract}
                </span>
              ) : null}
            </div>

            {decision.strategy ? (
              <p className="mt-2 text-xs text-slate-500">
                {decision.strategy}
              </p>
            ) : null}
          </div>

          <div className="w-full max-w-48">
            <ConfidenceMeter
              value={
                decision.confidence
              }
              size="md"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <DecisionMetric
            label="Expected Edge"
            value={
              typeof decision.expectedEdge ===
              "number"
                ? `${decision.expectedEdge.toFixed(
                    2,
                  )}%`
                : "--"
            }
          />

          <DecisionMetric
            label="Risk Score"
            value={
              typeof decision.riskScore ===
              "number"
                ? `${decision.riskScore.toFixed(
                    0,
                  )}/100`
                : "--"
            }
          />

          <DecisionMetric
            label="Suggested Size"
            value={
              typeof decision.suggestedSize ===
              "number"
                ? decision.suggestedSize.toLocaleString(
                    "en-US",
                  )
                : "--"
            }
          />
        </div>

        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="text-[8px] font-semibold uppercase tracking-wider text-slate-600">
            Rationale
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {decision.rationale}
          </p>
        </div>
      </div>
    </div>
  );
}

function DecisionMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950 p-3">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 font-mono text-xs font-semibold text-slate-300">
        {value}
      </div>
    </div>
  );
}