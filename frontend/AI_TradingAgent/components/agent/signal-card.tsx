"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Minus,
} from "lucide-react";

interface SignalCardProps {
  symbol?: string;
  action?: "BUY" | "SELL" | "HOLD";
  confidence?: number;
  signal?: string;
  rationale?: string;
  expectedEdge?: number;
}

export function SignalCard({
  symbol = "AAPL",
  action = "BUY",
  confidence = 87,
  signal = "Bullish momentum",
  rationale = "Price remains above short-term trend support while options flow shows positive call-side pressure.",
  expectedEdge = 4.8,
}: SignalCardProps) {
  const normalizedConfidence = Math.max(0, Math.min(100, confidence));

  const actionConfig = {
    BUY: {
      icon: ArrowUpRight,
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    },
    SELL: {
      icon: ArrowDownRight,
      className: "border-red-500/30 bg-red-500/10 text-red-400",
    },
    HOLD: {
      icon: Minus,
      className: "border-slate-700 bg-slate-900 text-slate-400",
    },
  } as const;

  const config = actionConfig[action];
  const ActionIcon = config.icon;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-slate-500" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              AI Signal
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-slate-100">
              {symbol}
            </span>

            <span className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[9px] text-slate-500">
              OPTIONS
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold ${config.className}`}
        >
          <ActionIcon className="h-3.5 w-3.5" />
          {action}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Signal</span>

          <span className="text-xs font-medium text-slate-200">
            {signal}
          </span>
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-slate-600">
              Confidence
            </span>

            <span className="font-mono text-xs font-semibold text-slate-200">
              {normalizedConfidence}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${normalizedConfidence}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          Rationale
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          {rationale}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Expected Edge
        </span>

        <span className="font-mono text-xs font-semibold text-emerald-400">
          +{expectedEdge.toFixed(1)}%
        </span>
      </div>
    </section>
  );
}

export default SignalCard;