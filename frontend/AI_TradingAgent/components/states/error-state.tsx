"use client";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to load data",
  message = "Something went wrong while loading this section.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex min-h-48 flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center ${className}`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
        <AlertTriangle
          className="h-5 w-5 text-red-400"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-sm font-semibold text-slate-100">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-400">
        {message}
      </p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden="true"
          />
          Retry
        </button>
      ) : null}
    </div>
  );
}