"use client";

import { useMemo } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Terminal } from "lucide-react";

import type { ExecutionEvent } from "@/types/agent";

interface ExecutionLogProps {
  events?: ExecutionEvent[];
  maxEvents?: number;
}

const DEFAULT_LOGS: ExecutionEvent[] = [
  {
    id: "log-001",
    timestamp: "2026-09-03T09:31:12Z",
    orderId: "ORD-98231",
    symbol: "AAPL",
    action: "buy",
    quantity: 2,
    price: 4.85,
    status: "filled",
    message: "Filled 2 contracts @ 4.85",
  },
  {
    id: "log-002",
    timestamp: "2026-09-03T09:30:48Z",
    orderId: "ORD-98230",
    symbol: "AAPL",
    action: "sell",
    quantity: 1,
    price: 2.15,
    status: "accepted",
    message: "Sell order accepted",
  },
  {
    id: "log-003",
    timestamp: "2026-09-03T09:30:21Z",
    orderId: "ORD-98229",
    symbol: "SPY",
    action: "buy",
    quantity: 1,
    price: 5.2,
    status: "partial",
    message: "Partial fill: 1 contract",
  },
  {
    id: "log-004",
    timestamp: "2026-09-03T09:29:55Z",
    orderId: "ORD-98228",
    symbol: "NVDA",
    action: "buy",
    quantity: 3,
    status: "submitted",
    message: "Order routed to execution venue",
  },
  {
    id: "log-005",
    timestamp: "2026-09-03T09:29:31Z",
    orderId: "ORD-98227",
    symbol: "MSFT",
    action: "sell",
    quantity: 2,
    price: 3.45,
    status: "rejected",
    message: "Risk limit exceeded",
  },
];

function formatTimestamp(timestamp: string): string {
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

function formatPrice(price?: number): string {
  if (price === undefined || !Number.isFinite(price)) {
    return "--";
  }

  return price.toFixed(2);
}

function getStatusClass(status: ExecutionEvent["status"]): string {
  switch (status) {
    case "filled":
      return "text-emerald-400";

    case "partial":
      return "text-amber-400";

    case "accepted":
      return "text-sky-400";

    case "submitted":
      return "text-slate-300";

    case "cancelled":
      return "text-slate-400";

    case "rejected":
      return "text-red-400";

    default:
      return "text-slate-400";
  }
}

export function ExecutionLog({
  events = DEFAULT_LOGS,
  maxEvents = 12,
}: ExecutionLogProps) {
  const visibleEvents = useMemo(
    () => events.slice(0, Math.max(1, maxEvents)),
    [events, maxEvents],
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
            <Terminal className="h-4 w-4 text-slate-400" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Execution Log
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Order routing and fill activity
            </p>
          </div>
        </div>

        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600">
          {visibleEvents.length} events
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/50 text-left">
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Time
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Order
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Symbol
              </th>
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Side
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Qty
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Price
              </th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80">
            {visibleEvents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-500"
                >
                  No execution activity available.
                </td>
              </tr>
            ) : (
              visibleEvents.map((event) => {
                const isBuy = event.action === "buy";

                return (
                  <tr
                    key={event.id}
                    className="transition-colors hover:bg-slate-900/60"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-slate-500">
                      {formatTimestamp(event.timestamp)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-slate-300">
                      {event.orderId}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-100">
                      {event.symbol}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase ${
                          isBuy ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpFromLine className="h-3 w-3" />
                        ) : (
                          <ArrowDownToLine className="h-3 w-3" />
                        )}
                        {event.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">
                      {event.quantity}
                    </td>

                    <td className="px-4 py-3 text-right font-mono text-xs text-slate-300">
                      {formatPrice(event.price)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-[10px] font-semibold uppercase ${getStatusClass(
                          event.status,
                        )}`}
                      >
                        {event.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {visibleEvents.length > 0 && (
        <div className="border-t border-slate-800 bg-slate-900/30 px-4 py-2.5">
          <p className="truncate text-xs text-slate-500">
            Latest: {visibleEvents[0]?.message ?? "No execution message"}
          </p>
        </div>
      )}
    </section>
  );
}

export default ExecutionLog;