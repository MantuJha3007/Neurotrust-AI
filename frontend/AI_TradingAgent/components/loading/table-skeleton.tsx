import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 6,
  columns = 7,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-800 bg-slate-950 ${className}`}
      aria-busy="true"
      aria-label="Loading table"
    >
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from(
            { length: columns },
            (_, index) => (
              <Skeleton
                key={`table-header-${index}`}
                className="h-3 bg-slate-800"
              />
            ),
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {Array.from(
          { length: rows },
          (_, rowIndex) => (
            <div
              key={`table-row-${rowIndex}`}
              className="grid gap-4 px-4 py-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from(
                { length: columns },
                (_, columnIndex) => (
                  <Skeleton
                    key={`table-cell-${rowIndex}-${columnIndex}`}
                    className={`h-4 bg-slate-800 ${
                      columnIndex === 0
                        ? "w-24"
                        : "w-full"
                    }`}
                  />
                ),
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}