"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  WifiOff,
} from "lucide-react";

interface OfflineStateProps {
  className?: string;
  compact?: boolean;
}

export function OfflineState({
  className = "",
  compact = false,
}: OfflineStateProps) {
  const [isOffline, setIsOffline] =
    useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setIsOffline(
        !window.navigator.onLine,
      );
    };

    updateStatus();

    window.addEventListener(
      "online",
      updateStatus,
    );

    window.addEventListener(
      "offline",
      updateStatus,
    );

    return () => {
      window.removeEventListener(
        "online",
        updateStatus,
      );

      window.removeEventListener(
        "offline",
        updateStatus,
      );
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  if (compact) {
    return (
      <div
        role="status"
        className={`inline-flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 ${className}`}
      >
        <WifiOff
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        Offline
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 ${className}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
        <WifiOff
          className="h-4 w-4 text-amber-400"
          aria-hidden="true"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-200">
          Connection unavailable
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Market data may be stale until your
          connection is restored.
        </p>
      </div>
    </div>
  );
}