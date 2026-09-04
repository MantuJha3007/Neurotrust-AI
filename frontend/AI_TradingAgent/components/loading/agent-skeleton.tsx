import { Skeleton } from "@/components/ui/skeleton";

export function AgentSkeleton() {
  return (
    <div
      className="space-y-6"
      aria-busy="true"
      aria-label="Loading AI agent"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from(
          { length: 3 },
          (_, index) => (
            <div
              key={`agent-card-${index}`}
              className="rounded-xl border border-slate-800 bg-slate-950 p-5"
            >
              <Skeleton className="mb-4 h-3 w-24 bg-slate-800" />
              <Skeleton className="h-8 w-28 bg-slate-800" />
              <Skeleton className="mt-3 h-3 w-20 bg-slate-800" />
            </div>
          ),
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <Skeleton className="mb-5 h-5 w-40 bg-slate-800" />

          <div className="flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full bg-slate-800" />

            <div className="flex-1 space-y-4">
              <Skeleton className="h-4 w-32 bg-slate-800" />
              <Skeleton className="h-3 w-full bg-slate-800" />
              <Skeleton className="h-3 w-4/5 bg-slate-800" />
              <Skeleton className="h-3 w-3/5 bg-slate-800" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
          <Skeleton className="mb-5 h-5 w-44 bg-slate-800" />

          <div className="space-y-5">
            {Array.from(
              { length: 5 },
              (_, index) => (
                <div
                  key={`agent-event-${index}`}
                  className="flex gap-4"
                >
                  <Skeleton className="mt-1 h-3 w-3 rounded-full bg-slate-800" />

                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 bg-slate-800" />
                    <Skeleton className="h-3 w-full bg-slate-800" />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}