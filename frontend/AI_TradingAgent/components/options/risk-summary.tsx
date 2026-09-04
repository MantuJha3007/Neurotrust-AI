import {
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

import type {
  StrategyRiskSummary,
} from "@/types/options";

interface RiskSummaryProps {
  risk: StrategyRiskSummary;
}

function formatMoney(
  value: number | null,
): string {
  if (value === null) {
    return "UNLIMITED";
  }

  return `$${Math.abs(
    value,
  ).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 0,
    },
  )}`;
}

export function RiskSummary({
  risk,
}: RiskSummaryProps) {
  const isDefined =
    risk.riskProfile ===
    "defined";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Risk Summary
          </h2>

          <p className="mt-1 text-[10px] text-slate-600">
            Portfolio impact of the selected
            strategy.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-semibold uppercase tracking-wider ${
            isDefined
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/20 bg-red-500/10 text-red-400"
          }`}
        >
          {isDefined ? (
            <ShieldCheck
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          ) : (
            <ShieldAlert
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          )}

          {isDefined
            ? "Defined Risk"
            : "Undefined Risk"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4">
        <RiskMetric
          label="Capital Required"
          value={formatMoney(
            risk.capitalRequired,
          )}
        />

        <RiskMetric
          label="Max Profit"
          value={formatMoney(
            risk.maxProfit,
          )}
        />

        <RiskMetric
          label="Max Loss"
          value={formatMoney(
            risk.maxLoss,
          )}
        />

        <RiskMetric
          label="Breakevens"
          value={
            risk.breakevens.length >
            0
              ? risk.breakevens
                  .map(
                    (
                      value,
                    ) =>
                      value.toFixed(
                        2,
                      ),
                  )
                  .join(
                    " / ",
                  )
              : "--"
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        <GreekMetric
          label="Delta"
          value={risk.netDelta}
        />

        <GreekMetric
          label="Gamma"
          value={risk.netGamma}
        />

        <GreekMetric
          label="Theta"
          value={risk.netTheta}
        />

        <GreekMetric
          label="Vega"
          value={risk.netVega}
        />
      </div>
    </div>
  );
}

function RiskMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-950 p-4">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
        {value}
      </div>
    </div>
  );
}

function GreekMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/40 p-3">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        Net {label}
      </div>

      <div
        className={`mt-1 font-mono text-xs font-semibold ${
          value > 0
            ? "text-emerald-400"
            : value < 0
              ? "text-red-400"
              : "text-slate-300"
        }`}
      >
        {value.toFixed(
          4,
        )}
      </div>
    </div>
  );
}