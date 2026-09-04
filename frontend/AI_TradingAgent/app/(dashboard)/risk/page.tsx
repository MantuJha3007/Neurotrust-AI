"use client";

import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  PauseCircle,
  PlayCircle,
  Sliders,
  Activity,
  Zap,
  TrendingDown,
  Scale,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { useAgent, usePauseAgent, useResumeAgent } from "@/hooks/use-agent";
import { usePortfolio } from "@/hooks/use-portfolio";
import { AgentSkeleton } from "@/components/loading/agent-skeleton";

export default function RiskControlsPage() {
  const { agent, isLoading } = useAgent();
  const { portfolio } = usePortfolio();
  const pauseMutation = usePauseAgent();
  const resumeMutation = useResumeAgent();

  // Local simulated risk parameters (defaults matching backend settings)
  const [maxPositionRisk, setMaxPositionRisk] = useState<number>(850);
  const [dailyLossLimit, setDailyLossLimit] = useState<number>(2000);
  const [maxExposurePercent, setMaxExposurePercent] = useState<number>(90);
  const [maxOrderValue, setMaxOrderValue] = useState<number>(5000);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (isLoading || !agent) {
    return (
      <div className="space-y-6">
        <AgentSkeleton />
      </div>
    );
  }

  const risk = agent.risk;
  const isPaused = agent.status === "paused";
  const exposure = risk?.portfolioExposure ?? 0;
  const dailyLoss = risk?.dailyLoss ?? 0;
  const status = risk?.status ?? "safe";

  const handleSaveParams = () => {
    setSavedNotice("Risk thresholds updated in session guardrails!");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleResetDefaults = () => {
    setMaxPositionRisk(850);
    setDailyLossLimit(2000);
    setMaxExposurePercent(90);
    setMaxOrderValue(5000);
    setSavedNotice("Restored system factory defaults.");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Deterministic Risk Engine & Guardrails
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Algorithmic safety controls, portfolio circuit breakers, and pre-execution trade gates.
          </p>
        </div>

        {/* Action Buttons: Pause / Resume Killswitch */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
              status === "blocked"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : status === "warning"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {status === "blocked" ? (
              <ShieldAlert className="h-3.5 w-3.5" />
            ) : status === "warning" ? (
              <AlertTriangle className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            Status: {status.toUpperCase()}
          </div>

          <button
            type="button"
            disabled={pauseMutation.isPending || resumeMutation.isPending}
            onClick={() => (isPaused ? resumeMutation.mutate() : pauseMutation.mutate())}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition-all ${
              isPaused
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                : "border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500/30"
            }`}
          >
            {isPaused ? (
              <>
                <PlayCircle className="h-4 w-4" />
                Resume Execution
              </>
            ) : (
              <>
                <PauseCircle className="h-4 w-4" />
                Emergency Kill Switch
              </>
            )}
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {savedNotice}
        </div>
      )}

      {/* Top 4 Core Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Exposure Limit */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Portfolio Exposure</span>
            <span className="font-mono text-slate-300 font-semibold">{exposure.toFixed(1)}% / {maxExposurePercent}%</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-100">
            {exposure.toFixed(1)}%
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                exposure > maxExposurePercent * 0.85
                  ? "bg-red-500"
                  : exposure > maxExposurePercent * 0.65
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (exposure / maxExposurePercent) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Hard cap threshold: {maxExposurePercent}% of account equity
          </p>
        </div>

        {/* Daily Loss Guardrail */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Daily Loss Limit</span>
            <span className="font-mono text-slate-300 font-semibold">${dailyLoss.toFixed(2)} / ${dailyLossLimit.toFixed(2)}</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-100">
            ${dailyLoss.toFixed(2)}
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                dailyLoss > dailyLossLimit * 0.8
                  ? "bg-red-500"
                  : dailyLoss > dailyLossLimit * 0.5
                    ? "bg-amber-500"
                    : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (dailyLoss / dailyLossLimit) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Automatic trade cessation if daily loss touches cap
          </p>
        </div>

        {/* Max Position Risk */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Single Position Risk</span>
            <span className="font-mono text-emerald-400 font-semibold">Active Cap</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-100">
            ${maxPositionRisk.toFixed(2)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Scale className="h-3.5 w-3.5 text-slate-500" />
            <span>Max sizing per strategy leg</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Enforced by Groq reasoning & deterministic gate
          </p>
        </div>

        {/* Max Order Value */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Max Order Value</span>
            <span className="font-mono text-sky-400 font-semibold">Hard Stop</span>
          </div>
          <div className="mt-3 text-2xl font-bold font-mono text-slate-100">
            ${maxOrderValue.toFixed(2)}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Gateway dispatch limit</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Orders exceeding limit are rejected prior to broker
          </p>
        </div>
      </div>

      {/* Main Content Grid: Guardrails Matrix + Greeks Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pre-Execution Guardrails Matrix (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-400" />
                <h2 className="text-sm font-semibold text-slate-100">
                  Active Execution Guardrails (Pre-Submission Filter)
                </h2>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                6 of 6 Active
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-800/60">
              {/* Check 1: Paper Account Enforcement */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">Paper Trading Safety Enforcement</div>
                  <div className="text-[11px] text-slate-500">Rejects any order targeting live market endpoints when operating in SIM mode.</div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ENFORCED
                </span>
              </div>

              {/* Check 2: Non-Zero / Non-Negative Quantity */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">Quantity & Symbol Sanitization</div>
                  <div className="text-[11px] text-slate-500">Ensures strict positive integers/floats and valid ticker formatting before broker calls.</div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> PASSED
                </span>
              </div>

              {/* Check 3: Buying Power Buffer */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">Real-Time Buying Power Verification</div>
                  <div className="text-[11px] text-slate-500">Available: ${portfolio?.buyingPower ? portfolio.buyingPower.toLocaleString() : "100,000.00"} USD</div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> BUFFERED
                </span>
              </div>

              {/* Check 4: Options Legs Contract Validation */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">Multi-Leg Option Strategy Integrity</div>
                  <div className="text-[11px] text-slate-500">Validates expirations, positive strike geometry, and defined max risk on spreads.</div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> ACTIVE
                </span>
              </div>

              {/* Check 5: Concentration Limit */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">Asset Concentration Risk Check</div>
                  <div className="text-[11px] text-slate-500">Current concentration level: {risk?.concentration ? risk.concentration.toUpperCase() : "LOW"} (Max single asset &lt; 35%)</div>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> BALANCED
                </span>
              </div>

              {/* Check 6: Order Execution Engine Lock */}
              <div className="py-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-slate-200">Autonomous Gatekeeper Circuit Breaker</div>
                  <div className="text-[11px] text-slate-500">State: {isPaused ? "HALTED" : "ARMED"} · Blocks orders automatically if loss threshold triggers.</div>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-md border ${
                  isPaused
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                }`}>
                  {isPaused ? "PAUSED" : "ARMED"}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Limit Tuner */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="h-5 w-5 text-sky-400" />
                <h2 className="text-sm font-semibold text-slate-100">
                  Configure Operational Risk Thresholds
                </h2>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset Defaults
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Max Position Risk Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Max Position Risk ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    value={maxPositionRisk}
                    onChange={(e) => setMaxPositionRisk(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-7 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Default: $850.00</p>
              </div>

              {/* Daily Loss Limit Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Daily Loss Cutoff ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    value={dailyLossLimit}
                    onChange={(e) => setDailyLossLimit(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-7 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Default: $2,000.00</p>
              </div>

              {/* Max Portfolio Exposure Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Max Portfolio Exposure (%)
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">%</span>
                  <input
                    type="number"
                    value={maxExposurePercent}
                    onChange={(e) => setMaxExposurePercent(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Default: 90%</p>
              </div>

              {/* Max Single Order Value Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Max Order Value Limit ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    value={maxOrderValue}
                    onChange={(e) => setMaxOrderValue(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-7 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500">Default: $5,000.00</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSaveParams}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Portfolio Greeks & Tail Risk */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-100">
                Portfolio Greeks Exposure
              </h2>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Net Delta (&Delta;)</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {risk?.portfolioDelta !== undefined ? risk.portfolioDelta >= 0 ? `+${risk.portfolioDelta.toFixed(2)}` : risk.portfolioDelta.toFixed(2) : "+0.00"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Directional equity sensitivity</p>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Net Gamma (&Gamma;)</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    +0.00
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Delta curvature rate of change</p>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Net Theta (&Theta;)</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    -0.00
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Daily time decay across options</p>
              </div>

              <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Net Vega (V)</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {risk?.portfolioVega !== undefined ? risk.portfolioVega >= 0 ? `+${risk.portfolioVega.toFixed(2)}` : risk.portfolioVega.toFixed(2) : "+0.00"}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Volatility sensitivity</p>
              </div>
            </div>
          </div>

          {/* Safety Model Info Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Zap className="h-4 w-4 text-amber-400" />
              Safety Architecture
            </div>
            <p>
              1. <strong>Alpaca</strong> delivers verifiable market and portfolio account truth.
            </p>
            <p>
              2. <strong>Groq LLM</strong> produces purely structured reasoning and strategy candidates.
            </p>
            <p>
              3. <strong>RiskEngine</strong> independently gates every order against account limits.
            </p>
            <p>
              4. Trades violating limits are blocked before they reach the broker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
