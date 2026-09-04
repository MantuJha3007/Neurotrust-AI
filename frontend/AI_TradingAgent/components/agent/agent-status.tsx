"use client";

import {
  Activity,
  BrainCircuit,
  Pause,
  Play,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";

interface AgentStatusProps {
  running?: boolean;
  connected?: boolean;
  strategy?: string;
  mode?: "paper" | "live";
  confidence?: number;
  onToggle?: () => void;
}

export function AgentStatus({
  running = true,
  connected = true,
  strategy = "Adaptive Options Momentum",
  mode = "paper",
  confidence = 87,
  onToggle,
}: AgentStatusProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
              running
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-slate-700 bg-slate-900"
            }`}
          >
            <BrainCircuit
              className={`h-5 w-5 ${
                running ? "text-emerald-400" : "text-slate-500"
              }`}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              AI Trading Agent
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Autonomous decision engine
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-semibold uppercase transition-colors ${
            running
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          {running ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
          {running ? "Pause" : "Start"}
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600">
            <Activity className="h-3 w-3" />
            Engine
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                running ? "bg-emerald-400" : "bg-slate-600"
              }`}
            />

            <span className="text-xs font-medium text-slate-300">
              {running ? "Running" : "Paused"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600">
            {connected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            Connection
          </div>

          <div className="mt-2 text-xs font-medium text-slate-300">
            {connected ? "Connected" : "Offline"}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            Strategy
          </span>

          <span
            className={`rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
              mode === "live"
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-sky-500/30 bg-sky-500/10 text-sky-400"
            }`}
          >
            {mode}
          </span>
        </div>

        <div className="mt-2 text-xs font-medium text-slate-200">
          {strategy}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600">
            <ShieldCheck className="h-3 w-3" />
            Decision Confidence
          </span>

          <span className="font-mono text-xs font-semibold text-slate-200">
            {Math.max(0, Math.min(100, confidence))}%
          </span>
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{
              width: `${Math.max(0, Math.min(100, confidence))}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default AgentStatus;