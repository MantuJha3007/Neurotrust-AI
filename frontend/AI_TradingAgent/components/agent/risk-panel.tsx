"use client";

import {
  AlertTriangle,
  Gauge,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";

interface RiskPanelProps {
  riskScore?: number | null;
  portfolioDelta?: number | null;
  portfolioGamma?: number | null;
  portfolioTheta?: number | null;
  portfolioVega?: number | null;
  maxDrawdown?: number | null;
  exposurePercent?: number | null;
}

function getRiskLevel(
  score: number,
): {
  label: string;
  className: string;
} {
  if (score >= 75) {
    return {
      label: "HIGH",
      className: "text-red-400",
    };
  }

  if (score >= 50) {
    return {
      label: "MODERATE",
      className: "text-amber-400",
    };
  }

  return {
    label: "LOW",
    className: "text-emerald-400",
  };
}

function formatNumber(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return value >= 0
    ? `+${value.toFixed(2)}`
    : value.toFixed(2);
}

function formatPercent(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "N/A";
  }

  return `${value.toFixed(1)}%`;
}

export function RiskPanel({
  riskScore = null,
  portfolioDelta = null,
  portfolioGamma = null,
  portfolioTheta = null,
  portfolioVega = null,
  maxDrawdown = null,
  exposurePercent = null,
}: RiskPanelProps) {
  const normalizedScore =
    riskScore === null ||
    riskScore === undefined
      ? null
      : Math.max(
          0,
          Math.min(100, riskScore),
        );

  const normalizedExposure =
    exposurePercent === null ||
    exposurePercent === undefined
      ? null
      : Math.max(
          0,
          Math.min(100, exposurePercent),
        );

  const riskLevel =
    normalizedScore === null
      ? null
      : getRiskLevel(normalizedScore);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
            <ShieldCheck className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Risk Monitor
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Portfolio-level exposure
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          <ShieldCheck className="h-3 w-3" />
          Protected
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-slate-500" />

            <span className="text-xs text-slate-500">
              Risk Score
            </span>
          </div>

          <span
            className={`text-xs font-bold ${
              riskLevel?.className ??
              "text-slate-600"
            }`}
          >
            {riskLevel?.label ?? "N/A"}
          </span>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <span className="font-mono text-2xl font-semibold text-slate-100">
            {normalizedScore ?? "N/A"}
          </span>

          {normalizedScore !== null ? (
            <span className="mb-1 text-[10px] text-slate-600">
              / 100
            </span>
          ) : null}
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
          {normalizedScore !== null ? (
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{
                width: `${normalizedScore}%`,
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-600">
            Net Delta
          </div>

          <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
            {formatNumber(portfolioDelta)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-600">
            Net Gamma
          </div>

          <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
            {formatNumber(portfolioGamma)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-600">
            Net Theta
          </div>

          <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
            {formatNumber(portfolioTheta)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-600">
            Net Vega
          </div>

          <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
            {formatNumber(portfolioVega)}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Capital Exposure
          </span>

          <span className="font-mono text-xs font-semibold text-slate-300">
            {formatPercent(
              normalizedExposure,
            )}
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          {normalizedExposure !== null ? (
            <div
              className="h-full rounded-full bg-sky-500 transition-all"
              style={{
                width: `${normalizedExposure}%`,
              }}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
        <div className="flex items-center gap-2">
          {maxDrawdown !== null &&
          maxDrawdown !== undefined &&
          maxDrawdown > 5 ? (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-slate-500" />
          )}

          <span className="text-xs text-slate-500">
            Current max drawdown
          </span>
        </div>

        <span className="font-mono text-xs font-semibold text-slate-300">
          {formatPercent(maxDrawdown)}
        </span>
      </div>
    </section>
  );
}

export default RiskPanel;