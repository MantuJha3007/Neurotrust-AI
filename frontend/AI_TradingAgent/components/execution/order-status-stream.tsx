"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";

import type { ExecutionEvent } from "@/types/agent";

interface OrderStatusStreamProps {
  events?: ExecutionEvent[];
  maxEvents?: number;
}

const DEFAULT_EVENTS: ExecutionEvent[] = [
  {
    id: "exec-001",
    timestamp: "2026-09-03T09:31:12Z",
    orderId: "ORD-98231",
    symbol: "AAPL",
    action: "buy",
    quantity: 2,
    price: 4.85,
    status: "filled",
    message: "Order completely filled",
  },
  {
    id: "exec-002",
    timestamp: "2026-09-03T09:30:48Z",
    orderId: "ORD-98230",
    symbol: "AAPL",
    action: "sell",
    quantity: 1,
    price: 2.15,
    status: "accepted",
    message: "Order accepted by execution venue",
  },
  {
    id: "exec-003",
    timestamp: "2026-09-03T09:30:21Z",
    orderId: "ORD-98229",
    symbol: "SPY",
    action: "buy",
    quantity: 1,
    price: 5.2,
    status: "partial",
    message: "Partial fill received",
  },
  {
    id: "exec-004",
    timestamp: "2026-09-03T09:29:55Z",
    orderId: "ORD-98228",
    symbol: "NVDA",
    action: "buy",
    quantity: 3,
    status: "submitted",
    message: "Order submitted for execution",
  },
];

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "--:--:--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function getStatusConfig(status: ExecutionEvent["status"]) {
  switch (status) {
    case "filled":
      return {
        label: "FILLED",
        className:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        icon: CheckCircle2,
      };

    case "partial":
      return {
        label: "PARTIAL",
        className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        icon: CircleDollarSign,
      };

    case "accepted":
      return {
        label: "ACCEPTED",
        className: "border-sky-500/30 bg-sky-500/10 text-sky-400",
        icon: CheckCircle2,
      };

    case "submitted":
      return {
        label: "SUBMITTED",
        className: "border-slate-500/30 bg-slate-500/10 text-slate-300",
        icon: Clock3,
      };

    case "cancelled":
      return {
        label: "CANCELLED",
        className: "border-slate-500/30 bg-slate-500/10 text-slate-400",
        icon: XCircle,
      };

    case "rejected":
      return {
        label: "REJECTED",
        className: "border-red-500/30 bg-red-500/10 text-red-400",
        icon: XCircle,
      };

    default:
      return {
        label: String(status).toUpperCase(),
        className: "border-slate-500/30 bg-slate-500/10 text-slate-400",
        icon: Clock3,
      };
  }
}

export function OrderStatusStream({
  events = DEFAULT_EVENTS,
  maxEvents = 8,
}: OrderStatusStreamProps) {
  const visibleEvents = useMemo(
    () => events.slice(0, Math.max(1, maxEvents)),
    [events, maxEvents],
  );

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Order Status
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Real-time execution updates
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          LIVE
        </div>
      </div>

      <div className="divide-y divide-slate-800/80">
        {visibleEvents.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center px-4 text-sm text-slate-500">
            No execution events yet.
          </div>
        ) : (
          visibleEvents.map((event) => {
            const status = getStatusConfig(event.status);
            const StatusIcon = status.icon;

            return (
              <div
                key={event.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-900/60"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
                  {event.status === "submitted" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                  ) : (
                    <StatusIcon className="h-4 w-4 text-slate-300" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-100">
                      {event.orderId}
                    </span>

                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {event.symbol}
                    </span>

                    <span
                      className={
                        event.action === "buy"
                          ? "text-[10px] font-semibold uppercase text-emerald-400"
                          : "text-[10px] font-semibold uppercase text-red-400"
                      }
                    >
                      {event.action}
                    </span>
                  </div>

                  <div className="mt-1 truncate text-xs text-slate-500">
                    {event.message}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[9px] font-semibold tracking-wide ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <span className="font-mono text-[10px] text-slate-600">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default OrderStatusStream;