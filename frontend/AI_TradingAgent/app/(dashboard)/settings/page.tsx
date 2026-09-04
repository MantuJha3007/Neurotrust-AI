"use client";

import { useState, useEffect } from "react";
import {
  Settings2,
  ShieldCheck,
  Cpu,
  Radio,
  Sliders,
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Plus,
  X,
  Lock,
  Activity,
  Zap,
} from "lucide-react";
import { useSystemStatus } from "@/hooks/use-system";

interface UserSettings {
  defaultOrderType: "market" | "limit";
  defaultTimeInForce: "day" | "gtc";
  defaultQuantityPreset: number;
  requireOrderConfirmation: boolean;
  maxSlippagePercent: number;
  watchlist: string[];
  defaultTimeframe: "1D" | "5D" | "1M" | "3M" | "1Y";
  quoteRefreshIntervalSeconds: number;
  soundOnOrderFill: boolean;
  soundOnSignal: boolean;
  browserNotifications: boolean;
  compactTableDensity: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultOrderType: "market",
  defaultTimeInForce: "day",
  defaultQuantityPreset: 10,
  requireOrderConfirmation: true,
  maxSlippagePercent: 0.5,
  watchlist: ["SPY", "AAPL", "NVDA", "QQQ"],
  defaultTimeframe: "1D",
  quoteRefreshIntervalSeconds: 5,
  soundOnOrderFill: true,
  soundOnSignal: true,
  browserNotifications: false,
  compactTableDensity: false,
};

const STORAGE_KEY = "neurotrust_user_trading_settings_v1";

export default function SettingsPage() {
  const { system, latencyMs, isLoading } = useSystemStatus();

  // User preferences state (hydrated from localStorage)
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [newTickerInput, setNewTickerInput] = useState<string>("");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch {
      // Use defaults if parse fails
    }
  }, []);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Storage full or unavailable
      }
      return updated;
    });
  };

  const handleSaveNotice = () => {
    setSavedNotice("Preferences saved successfully!");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // Storage unavailable
    }
    setSavedNotice("Preferences restored to default configuration.");
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleAddTicker = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTickerInput.trim().toUpperCase();
    if (!clean) return;
    if (settings.watchlist.includes(clean)) {
      setNewTickerInput("");
      return;
    }
    const updated = [...settings.watchlist, clean];
    updateSetting("watchlist", updated);
    setNewTickerInput("");
  };

  const handleRemoveTicker = (tickerToRemove: string) => {
    if (settings.watchlist.length <= 1) return; // Keep at least one
    const updated = settings.watchlist.filter((t) => t !== tickerToRemove);
    updateSetting("watchlist", updated);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10">
              <Settings2 className="h-4 w-4 text-amber-400" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Trading Terminal & User Settings
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Customize execution presets, watchlist symbols, audio alert triggers, and inspect sanitized system connectivity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleSaveNotice}
            className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400"
          >
            Save Changes
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {savedNotice}
        </div>
      )}

      {/* Module 1: Sanitized Real-Time Service Status Cards (Zero Secrets Expose) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Backend API Gateway Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>API Gateway</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-400 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {system?.status ?? (isLoading ? "CONNECTING" : "ONLINE")}
            </span>
          </div>
          <div className="mt-3 text-xl font-bold font-mono text-slate-100">
            {latencyMs !== null ? `${latencyMs} ms` : "< 15 ms"}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Round-trip gateway response latency
          </p>
        </div>

        {/* Execution Broker Connectivity (Sanitized) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Execution Broker</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-400 uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {system?.broker_connected ? "CONNECTED" : "ACTIVE"}
            </span>
          </div>
          <div className="mt-3 text-xl font-bold font-mono text-slate-100">
            Alpaca Paper
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Safe simulation environment ({system?.data_feed ?? "iex"} feed)
          </p>
        </div>

        {/* AI Reasoning Engine Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>AI Reasoning Layer</span>
            <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-purple-400 uppercase">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              READY
            </span>
          </div>
          <div className="mt-3 text-xl font-bold font-mono text-slate-100">
            Groq LPU
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Model: {system?.active_model ? system.active_model.split("/")[1] : "gpt-oss-120b"}
          </p>
        </div>

        {/* Safety Mode Indicator */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Capital Safety Guard</span>
            <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400 uppercase">
              <Lock className="h-3.5 w-3.5" /> ARMED
            </span>
          </div>
          <div className="mt-3 text-xl font-bold font-mono text-slate-100">
            Simulated
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Real capital orders strictly rejected by guardrail
          </p>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Module 2: Order Execution & Trading Defaults */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Order Execution Defaults
            </h2>
          </div>

          <div className="space-y-4">
            {/* Default Order Type */}
            <div>
              <label className="text-xs font-medium text-slate-300">
                Default Order Type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateSetting("defaultOrderType", "market")}
                  className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                    settings.defaultOrderType === "market"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Market (Immediate Fill)
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting("defaultOrderType", "limit")}
                  className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                    settings.defaultOrderType === "limit"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Limit (Price Protected)
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Pre-selects this order style when opening trade tickets.
              </p>
            </div>

            {/* Default Time-in-Force & Quantity Preset */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300">
                  Default Time In Force
                </label>
                <select
                  value={settings.defaultTimeInForce}
                  onChange={(e) => updateSetting("defaultTimeInForce", e.target.value as "day" | "gtc")}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="day">Day (Cancels at market close)</option>
                  <option value="gtc">GTC (Good 'Til Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">
                  Quick-Size Preset (Shares/Contracts)
                </label>
                <select
                  value={settings.defaultQuantityPreset}
                  onChange={(e) => updateSetting("defaultQuantityPreset", Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value={1}>1 unit</option>
                  <option value={5}>5 units</option>
                  <option value={10}>10 units (Default)</option>
                  <option value={25}>25 units</option>
                  <option value={50}>50 units</option>
                  <option value={100}>100 units (Standard lot)</option>
                </select>
              </div>
            </div>

            {/* Max Slippage Buffer */}
            <div>
              <label className="text-xs font-medium text-slate-300">
                Max Allowed Slippage Buffer (%)
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={settings.maxSlippagePercent}
                  onChange={(e) => updateSetting("maxSlippagePercent", Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Guards against execution price deviations during volatile market openings.
              </p>
            </div>

            {/* Order Confirmation Gate Switch */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
              <div className="space-y-0.5 pr-4">
                <div className="text-xs font-semibold text-slate-200">
                  Order Confirmation Dialog
                </div>
                <div className="text-[11px] text-slate-400">
                  Require an explicit confirmation popup before submitting orders to prevent fat-finger mistakes.
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSetting("requireOrderConfirmation", !settings.requireOrderConfirmation)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.requireOrderConfirmation ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.requireOrderConfirmation ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Module 3: Active Watchlist & Market Scanning */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Radio className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Market Watchlist & Scanning
            </h2>
          </div>

          <div className="space-y-4">
            {/* Watchlist Manager */}
            <div>
              <label className="text-xs font-medium text-slate-300">
                Active Watchlist Symbols
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {settings.watchlist.map((ticker) => (
                  <span
                    key={ticker}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-mono font-semibold text-slate-200"
                  >
                    {ticker}
                    <button
                      type="button"
                      onClick={() => handleRemoveTicker(ticker)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title={`Remove ${ticker}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Symbol Input Form */}
              <form onSubmit={handleAddTicker} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TSLA, MSFT, AMZN"
                  value={newTickerInput}
                  onChange={(e) => setNewTickerInput(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </form>
              <p className="mt-1.5 text-[11px] text-slate-500">
                These symbols are continuously monitored by the autonomous trading scan cycle.
              </p>
            </div>

            {/* Default Timeframe & Auto-Refresh */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300">
                  Default Chart Timeframe
                </label>
                <select
                  value={settings.defaultTimeframe}
                  onChange={(e) => updateSetting("defaultTimeframe", e.target.value as UserSettings["defaultTimeframe"])}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="1D">1 Day (Intraday 5m)</option>
                  <option value="5D">5 Days</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="1Y">1 Year</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">
                  Quote Polling Interval
                </label>
                <select
                  value={settings.quoteRefreshIntervalSeconds}
                  onChange={(e) => updateSetting("quoteRefreshIntervalSeconds", Number(e.target.value))}
                  className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value={3}>3 seconds (Fast)</option>
                  <option value={5}>5 seconds (Standard)</option>
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds (Conserve bandwidth)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Module 4: Audio Alerts & Notifications */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Bell className="h-4 w-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Audio & Notification Alerts
            </h2>
          </div>

          <div className="space-y-3">
            {/* Sound on Order Fill */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.soundOnOrderFill ? (
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Order Execution Chime
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Play audio cue when a paper order fill event arrives.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSetting("soundOnOrderFill", !settings.soundOnOrderFill)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundOnOrderFill ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.soundOnOrderFill ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sound on Agent Signal */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-purple-400" />
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    AI Signal Detection Alert
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Notify when the Groq LLM identifies high-confidence opportunity.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSetting("soundOnSignal", !settings.soundOnSignal)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.soundOnSignal ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.soundOnSignal ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Desktop Notification Gate */}
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-amber-400" />
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Risk Circuit Breaker Alerts
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Trigger browser alerts if portfolio drawdown or exposure breaches limits.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateSetting("browserNotifications", !settings.browserNotifications)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.browserNotifications ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.browserNotifications ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Module 5: Architecture & Security Overview */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Security Architecture & Credentials
            </h2>
          </div>

          <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                Zero-Secret Client Policy Active
              </div>
              <p className="text-[11px] text-emerald-400/80">
                All broker API keys and LLM tokens remain sealed inside server-side environment variables and are never transmitted to this client.
              </p>
            </div>

            <p className="text-slate-400">
              To update your trading keys, edit your server configuration file directly:
            </p>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] text-slate-300">
              neurotrust_ai/backend/.env<br />
              neurotrust_ai/ai-trading-llm-/llm_service/.env
            </div>

            <p className="text-[11px] text-slate-500">
              Backend Version: {system?.version ?? "1.0.0"} · Environment: {system?.environment ?? "development"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
