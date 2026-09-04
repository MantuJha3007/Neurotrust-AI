import {
  AlertTriangle,
  Check,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  ActionBadge,
} from "@/components/agent/action-badge";

import type {
  AgentDecisionEvent,
} from "@/types/agent";

interface DecisionEventProps {
  event: AgentDecisionEvent;
  isLast?: boolean;
}

function formatTime(
  timestamp: string,
): string {
  const date =
    new Date(timestamp);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return timestamp;
  }

  return date.toLocaleTimeString(
    "en-US",
    {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    },
  );
}

function getStatusIcon(
  status: AgentDecisionEvent["status"],
) {
  switch (status) {
    case "completed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
          <Check
            className="h-3 w-3 text-emerald-400"
            aria-hidden="true"
          />
        </div>
      );

    case "running":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10">
          <Loader2
            className="h-3 w-3 animate-spin text-sky-400"
            aria-hidden="true"
          />
        </div>
      );

    case "warning":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10">
          <AlertTriangle
            className="h-3 w-3 text-amber-400"
            aria-hidden="true"
          />
        </div>
      );

    case "failed":
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
          <XCircle
            className="h-3 w-3 text-red-400"
            aria-hidden="true"
          />
        </div>
      );

    case "pending":
    default:
      return (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
          <Circle
            className="h-2.5 w-2.5 text-slate-600"
            aria-hidden="true"
          />
        </div>
      );
  }
}

function getCategoryLabel(
  category: AgentDecisionEvent["category"],
): string {
  switch (category) {
    case "market":
      return "MARKET";

    case "signal":
      return "SIGNAL";

    case "strategy":
      return "STRATEGY";

    case "risk":
      return "RISK";

    case "execution":
      return "EXECUTION";

    case "system":
      return "SYSTEM";

    default:
      return "EVENT";
  }
}

export function DecisionEvent({
  event,
  isLast = false,
}: DecisionEventProps) {
  return (
    <div className="relative flex gap-3">
      {!isLast ? (
        <div className="absolute bottom-[-16px] left-3 top-7 w-px bg-slate-800" />
      ) : null}

      <div className="relative z-10 shrink-0">
        {getStatusIcon(
          event.status,
        )}
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-semibold uppercase tracking-wider text-slate-600">
                {getCategoryLabel(
                  event.category,
                )}
              </span>

              {event.action ? (
                <ActionBadge
                  action={
                    event.action
                  }
                  size="sm"
                />
              ) : null}
            </div>

            <h3 className="mt-1 text-xs font-semibold text-slate-200">
              {event.title}
            </h3>
          </div>

          <span className="shrink-0 font-mono text-[9px] text-slate-700">
            {formatTime(
              event.timestamp,
            )}
          </span>
        </div>

        <p className="mt-1 max-w-2xl text-[10px] leading-5 text-slate-500">
          {event.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          {event.symbol ? (
            <span className="font-mono text-[9px] font-semibold text-slate-400">
              {event.symbol}
            </span>
          ) : null}

          {event.contract ? (
            <span className="font-mono text-[9px] text-slate-600">
              {event.contract}
            </span>
          ) : null}

          {typeof event.confidence ===
          "number" ? (
            <span className="font-mono text-[9px] text-slate-600">
              Confidence{" "}
              <span className="text-slate-400">
                {event.confidence.toFixed(
                  0,
                )}
                %
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}