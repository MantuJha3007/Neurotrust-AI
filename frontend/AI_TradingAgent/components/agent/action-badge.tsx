import type {
  AgentAction,
} from "@/types/agent";

interface ActionBadgeProps {
  action: AgentAction;
  size?: "sm" | "md";
}

const actionLabels: Record<
  AgentAction,
  string
> = {
  analyze: "ANALYZE",
  buy: "BUY",
  sell: "SELL",
  hold: "HOLD",
  hedge: "HEDGE",
  reject: "REJECT",
  execute: "EXECUTE",
  monitor: "MONITOR",
};

function getActionClasses(
  action: AgentAction,
): string {
  switch (action) {
    case "buy":
    case "execute":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    case "sell":
    case "reject":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "hedge":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    case "hold":
    case "monitor":
      return "border-slate-700 bg-slate-800/70 text-slate-400";

    case "analyze":
    default:
      return "border-sky-500/20 bg-sky-500/10 text-sky-400";
  }
}

export function ActionBadge({
  action,
  size = "md",
}: ActionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono font-semibold tracking-wider ${
        size === "sm"
          ? "px-1.5 py-0.5 text-[8px]"
          : "px-2 py-1 text-[9px]"
      } ${getActionClasses(action)}`}
    >
      {actionLabels[action]}
    </span>
  );
}