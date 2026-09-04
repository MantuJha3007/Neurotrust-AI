"use client";

import {
  RefreshCw,
} from "lucide-react";

interface OptionsChainHeaderProps {
  symbol: string;
  underlyingPrice: number | null;
  expiry: string;
  isFetching?: boolean;
  onRefresh?: () => void;
  onExpiryChange?: (
    expiry: string,
  ) => void;
}

const expiryOptions = [
  "2026-09-18",
  "2026-09-25",
  "2026-10-16",
];

export function OptionsChainHeader({
  symbol,
  underlyingPrice,
  expiry,
  isFetching = false,
  onRefresh,
  onExpiryChange,
}: OptionsChainHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-lg font-semibold text-slate-100">
              {symbol}
            </h2>

            <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Options
            </span>
          </div>

          <div className="mt-1 flex items-center gap-3">
            <span className="font-mono text-sm text-slate-400">
              Spot
            </span>

            <span className="font-mono text-sm font-semibold text-slate-100">
              {underlyingPrice !==
              null
                ? `$${underlyingPrice.toFixed(
                    2,
                  )}`
                : "--"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="option-expiry"
          className="sr-only"
        >
          Expiration date
        </label>

        <select
          id="option-expiry"
          value={expiry}
          onChange={(event) =>
            onExpiryChange?.(
              event.target.value,
            )
          }
          className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 font-mono text-xs text-slate-200 outline-none transition focus:border-slate-500"
        >
          {expiryOptions.map(
            (date) => (
              <option
                key={date}
                value={date}
              >
                {date}
              </option>
            ),
          )}
        </select>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isFetching}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 text-xs font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              isFetching
                ? "animate-spin"
                : ""
            }`}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>
    </div>
  );
}