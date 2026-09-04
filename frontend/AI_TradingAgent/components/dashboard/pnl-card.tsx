"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Minus,
} from "lucide-react";

interface PnlCardProps {
  pnl?: number;
  pnlPercent?: number;
  realizedPnl?: number | null;
  unrealizedPnl?: number | null;
  period?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function getValueColor(value: number): string {
  if (value > 0) {
    return "text-emerald-400";
  }

  if (value < 0) {
    return "text-red-400";
  }

  return "text-slate-400";
}

function formatOptionalCurrency(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "N/A";
  }

  return `${value < 0 ? "-" : ""}${formatCurrency(value)}`;
}

export function PnlCard({
  pnl = 0,
  pnlPercent = 0,
  realizedPnl = null,
  unrealizedPnl = null,
  period = "Today",
}: PnlCardProps) {
  const isPositive = pnl > 0;
  const isNegative = pnl < 0;
  const isNeutral = pnl === 0;

  const hasBreakdown =
    realizedPnl !== null &&
    realizedPnl !== undefined &&
    unrealizedPnl !== null &&
    unrealizedPnl !== undefined;

  const realizedComposition =
    hasBreakdown && Math.abs(pnl) > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (Math.abs(realizedPnl ?? 0) /
              Math.abs(pnl)) *
              100,
          ),
        )
      : 0;

  const unrealizedComposition =
    hasBreakdown && Math.abs(pnl) > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (Math.abs(unrealizedPnl ?? 0) /
              Math.abs(pnl)) *
              100,
          ),
        )
      : 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
            <BarChart3 className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Profit & Loss
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Trading performance · {period}
            </p>
          </div>
        </div>

        <div
          className={`rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            isPositive
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
              : isNegative
                ? "border-red-500/20 bg-red-500/5 text-red-400"
                : "border-slate-700 bg-slate-900 text-slate-400"
          }`}
        >
          {isPositive
            ? "Profit"
            : isNegative
              ? "Loss"
              : "Flat"}
        </div>
      </div>

      <div className="mt-6">
        <div
          className={`font-mono text-3xl font-semibold tracking-tight ${getValueColor(
            pnl,
          )}`}
        >
          {isNegative ? "-" : ""}
          {formatCurrency(pnl)}
        </div>

        <div className="mt-2 flex items-center gap-2">
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          ) : isNegative ? (
            <ArrowDownRight className="h-4 w-4 text-red-400" />
          ) : (
            <Minus className="h-4 w-4 text-slate-500" />
          )}

          <span
            className={`font-mono text-sm font-medium ${getValueColor(
              pnlPercent,
            )}`}
          >
            {formatPercent(pnlPercent)}
          </span>

          <span className="text-xs text-slate-600">
            vs previous close
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Realized P&L
          </span>

          <span
            className={`font-mono text-xs font-medium ${
              realizedPnl === null ||
              realizedPnl === undefined
                ? "text-slate-600"
                : getValueColor(realizedPnl)
            }`}
          >
            {formatOptionalCurrency(
              realizedPnl,
            )}
          </span>
        </div>

        <div className="h-px bg-slate-800" />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Unrealized P&L
          </span>

          <span
            className={`font-mono text-xs font-medium ${
              unrealizedPnl === null ||
              unrealizedPnl === undefined
                ? "text-slate-600"
                : getValueColor(unrealizedPnl)
            }`}
          >
            {formatOptionalCurrency(
              unrealizedPnl,
            )}
          </span>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            P&L Composition
          </span>

          <span className="font-mono text-[10px] text-slate-600">
            {hasBreakdown
              ? `${Math.round(
                  realizedComposition,
                )}% realized`
              : "Breakdown unavailable"}
          </span>
        </div>

        <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-800">
          {hasBreakdown ? (
            <>
              <div
                className="h-full rounded-l-full bg-emerald-500/70"
                style={{
                  width: `${realizedComposition}%`,
                }}
              />

              <div
                className="h-full bg-sky-500/50"
                style={{
                  width: `${unrealizedComposition}%`,
                }}
              />
            </>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Daily Mark
        </span>

        <span
          className={`font-mono text-[10px] ${
            isNeutral
              ? "text-slate-600"
              : getValueColor(pnl)
          }`}
        >
          {isPositive
            ? "POSITIVE"
            : isNegative
              ? "NEGATIVE"
              : "NEUTRAL"}
        </span>
      </div>
    </section>
  );
}

export default PnlCard;