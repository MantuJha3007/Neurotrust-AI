"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface PortfolioCardProps {
  totalValue?: number;
  dayPnl?: number;
  dayPnlPercent?: number;
  investedValue?: number;
  cashBalance?: number;
}

const DEFAULT_VALUES = {
  totalValue: 125_480.32,
  dayPnl: 1_842.64,
  dayPnlPercent: 1.49,
  investedValue: 98_250.18,
  cashBalance: 27_230.14,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function PortfolioCard({
  totalValue = DEFAULT_VALUES.totalValue,
  dayPnl = DEFAULT_VALUES.dayPnl,
  dayPnlPercent = DEFAULT_VALUES.dayPnlPercent,
  investedValue = DEFAULT_VALUES.investedValue,
  cashBalance = DEFAULT_VALUES.cashBalance,
}: PortfolioCardProps) {
  const isPositive = dayPnl >= 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl shadow-black/10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900">
            <BriefcaseBusiness className="h-5 w-5 text-slate-300" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Portfolio Value
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Total account equity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-2 py-1">
          <TrendingUp className="h-3 w-3 text-emerald-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            Live
          </span>
        </div>
      </div>

      {/* Main Value */}
      <div className="mt-6">
        <div className="font-mono text-3xl font-semibold tracking-tight text-slate-50">
          {formatCurrency(totalValue)}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`flex items-center gap-1 font-mono text-sm font-medium ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}

            {formatCurrency(Math.abs(dayPnl))}
          </span>

          <span
            className={`font-mono text-xs ${
              isPositive ? "text-emerald-500" : "text-red-500"
            }`}
          >
            ({formatPercent(dayPnlPercent)})
          </span>

          <span className="text-xs text-slate-600">today</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Invested
            </span>
          </div>

          <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
            {formatCurrency(investedValue)}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Cash
            </span>
          </div>

          <div className="mt-2 font-mono text-sm font-semibold text-slate-200">
            {formatCurrency(cashBalance)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-[10px] uppercase tracking-wider text-slate-600">
          Account Equity
        </span>

        <span className="font-mono text-[10px] text-slate-500">
          USD
        </span>
      </div>
    </section>
  );
}

export default PortfolioCard;