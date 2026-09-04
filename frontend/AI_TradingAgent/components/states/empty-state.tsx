import {
  Inbox,
} from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function EmptyState({
  title = "No data available",
  message = "There is currently nothing to display here.",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-6 text-center ${className}`}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
        <Inbox
          className="h-5 w-5 text-slate-500"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-sm font-semibold text-slate-200">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}