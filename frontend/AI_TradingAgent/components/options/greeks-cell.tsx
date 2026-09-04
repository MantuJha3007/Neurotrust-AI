interface GreeksCellProps {
  label: string;
  value: number;
  suffix?: string;
  precision?: number;
  positiveIsGood?: boolean;
}

export function GreeksCell({
  label,
  value,
  suffix = "",
  precision = 2,
  positiveIsGood = false,
}: GreeksCellProps) {
  const isPositive =
    value > 0;

  const isNegative =
    value < 0;

  let valueClass =
    "text-slate-300";

  if (positiveIsGood) {
    if (isPositive) {
      valueClass =
        "text-emerald-400";
    } else if (isNegative) {
      valueClass =
        "text-red-400";
    }
  }

  return (
    <div className="flex min-w-16 flex-col items-end">
      <span className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </span>

      <span
        className={`font-mono text-[11px] font-medium ${valueClass}`}
      >
        {value.toFixed(
          precision,
        )}
        {suffix}
      </span>
    </div>
  );
}