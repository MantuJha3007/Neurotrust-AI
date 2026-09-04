"use client";

import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  CircleDot,
  ShieldAlert,
  TrendingUp,
  XCircle,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  status?: "completed" | "running" | "warning" | "failed";
  category?: "market" | "signal" | "strategy" | "risk" | "execution";
}

interface DecisionTimelineProps {
  events?: TimelineEvent[];
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  {
    id: "decision-001",
    timestamp: "09:31:12",
    title: "Execution completed",
    description: "AAPL call position filled at the target limit price.",
    status: "completed",
    category: "execution",
  },
  {
    id: "decision-002",
    timestamp: "09:30:58",
    title: "Risk validation passed",
    description: "Portfolio exposure remained within configured risk limits.",
    status: "completed",
    category: "risk",
  },
  {
    id: "decision-003",
    timestamp: "09:30:42",
    title: "Strategy selected",
    description: "Bull call spread produced the highest risk-adjusted edge.",
    status: "completed",
    category: "strategy",
  },
  {
    id: "decision-004",
    timestamp: "09:30:21",
    title: "Bullish signal detected",
    description: "Momentum and options-flow models aligned positively.",
    status: "completed",
    category: "signal",
  },
  {
    id: "decision-005",
    timestamp: "09:30:05",
    title: "Market scan completed",
    description: "Agent evaluated volatility, trend, liquidity, and flow data.",
    status: "completed",
    category: "market",
  },
];

function getCategoryIcon(
  category: TimelineEvent["category"],
): typeof BrainCircuit {
  switch (category) {
    case "market":
      return TrendingUp;
    case "signal":
      return BrainCircuit;
    case "strategy":
      return CircleDot;
    case "risk":
      return ShieldAlert;
    case "execution":
      return CheckCircle2;
    default:
      return BrainCircuit;
  }
}

function getStatusIcon(status: TimelineEvent["status"]) {
  switch (status) {
    case "completed":
      return CheckCircle2;
    case "running":
      return CircleDot;
    case "warning":
      return AlertTriangle;
    case "failed":
      return XCircle;
    default:
      return CircleDot;
  }
}

export function DecisionTimeline({
  events = DEFAULT_EVENTS,
}: DecisionTimelineProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/10">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-100">
          Decision Timeline
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Agent reasoning and execution sequence
        </p>
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-32 items-center justify-center text-sm text-slate-600">
          No decision events available.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-4 left-[15px] top-4 w-px bg-slate-800" />

          <div className="space-y-5">
            {events.map((event) => {
              const CategoryIcon = getCategoryIcon(event.category);
              const StatusIcon = getStatusIcon(event.status);

              return (
                <div
                  key={event.id}
                  className="relative flex gap-3"
                >
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-950">
                    <CategoryIcon className="h-3.5 w-3.5 text-slate-400" />
                  </div>

                  <div className="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200">
                          {event.title}
                        </div>

                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {event.description}
                        </p>
                      </div>

                      <span className="shrink-0 font-mono text-[10px] text-slate-600">
                        {event.timestamp}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5">
                      <StatusIcon
                        className={`h-3 w-3 ${
                          event.status === "failed"
                            ? "text-red-400"
                            : event.status === "warning"
                              ? "text-amber-400"
                              : event.status === "running"
                                ? "text-sky-400"
                                : "text-emerald-400"
                        }`}
                      />

                      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                        {event.status ?? "completed"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

export default DecisionTimeline;