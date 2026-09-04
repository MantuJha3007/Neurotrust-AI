import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

export function ChartSkeleton({
  height = 360,
  className = "",
}: ChartSkeletonProps) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950 p-5 ${className}`}
      aria-busy="true"
      aria-label="Loading chart"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36 bg-slate-800" />
          <Skeleton className="h-3 w-24 bg-slate-800" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-8 w-12 bg-slate-800" />
          <Skeleton className="h-8 w-12 bg-slate-800" />
          <Skeleton className="h-8 w-12 bg-slate-800" />
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40"
        style={{ height }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          {Array.from(
            { length: 6 },
            (_, index) => (
              <div
                key={`chart-grid-${index}`}
                className="border-t border-dashed border-slate-800"
              />
            ),
          )}
        </div>

        <div className="absolute inset-x-6 bottom-8 top-8 flex items-end gap-1">
          {Array.from(
            { length: 42 },
            (_, index) => {
              const heightValue =
                20 +
                ((index * 17) % 65);

              return (
                <Skeleton
                  key={`chart-bar-${index}`}
                  className="flex-1 rounded-t bg-slate-800"
                  style={{
                    height: `${heightValue}%`,
                  }}
                />
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}