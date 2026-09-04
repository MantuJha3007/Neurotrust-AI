import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  lines?: number;
  showHeader?: boolean;
  className?: string;
}

export function CardSkeleton({
  lines = 3,
  showHeader = true,
  className = "",
}: CardSkeletonProps) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-950 p-5 ${className}`}
      aria-busy="true"
      aria-label="Loading card"
    >
      {showHeader ? (
        <div className="mb-5 flex items-center justify-between">
          <Skeleton className="h-5 w-32 bg-slate-800" />
          <Skeleton className="h-8 w-20 bg-slate-800" />
        </div>
      ) : null}

      <div className="space-y-4">
        {Array.from(
          { length: lines },
          (_, index) => (
            <div
              key={`card-skeleton-line-${index}`}
              className="space-y-2"
            >
              <Skeleton className="h-3 w-20 bg-slate-800" />
              <Skeleton
                className={`h-5 bg-slate-800 ${
                  index % 2 === 0
                    ? "w-3/4"
                    : "w-1/2"
                }`}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}