interface ConfidenceMeterProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

function clamp(
  value: number,
): number {
  return Math.min(
    100,
    Math.max(0, value),
  );
}

function getConfidenceColor(
  value: number,
): string {
  if (value >= 80) {
    return "text-emerald-400";
  }

  if (value >= 60) {
    return "text-amber-400";
  }

  return "text-red-400";
}

export function ConfidenceMeter({
  value,
  label = "AI Confidence",
  showValue = true,
  size = "md",
}: ConfidenceMeterProps) {
  const normalizedValue =
    clamp(value);

  const valueColor =
    getConfidenceColor(
      normalizedValue,
    );

  const heightClass =
    size === "sm"
      ? "h-1"
      : size === "lg"
        ? "h-2"
        : "h-1.5";

  const textClass =
    size === "sm"
      ? "text-[10px]"
      : size === "lg"
        ? "text-sm"
        : "text-xs";

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-600">
          {label}
        </span>

        {showValue ? (
          <span
            className={`font-mono font-semibold ${textClass} ${valueColor}`}
          >
            {normalizedValue.toFixed(
              0,
            )}
            %
          </span>
        ) : null}
      </div>

      <div
        className={`w-full overflow-hidden rounded-full bg-slate-800 ${heightClass}`}
        role="progressbar"
        aria-valuenow={
          normalizedValue
        }
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            normalizedValue >=
            80
              ? "bg-emerald-500"
              : normalizedValue >=
                  60
                ? "bg-amber-500"
                : "bg-red-500"
          }`}
          style={{
            width: `${normalizedValue}%`,
          }}
        />
      </div>
    </div>
  );
}