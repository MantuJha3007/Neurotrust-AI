"use client";

import {
  Trash2,
} from "lucide-react";

import type {
  OptionAction,
  OptionLeg,
} from "@/types/options";

interface StrategyLegProps {
  leg: OptionLeg;
  onUpdate: (
    updates: Partial<OptionLeg>,
  ) => void;
  onRemove: () => void;
}

export function StrategyLeg({
  leg,
  onUpdate,
  onRemove,
}: StrategyLegProps) {
  const actionClass =
    leg.action === "buy"
      ? "text-emerald-400"
      : "text-red-400";

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={leg.action}
          onChange={(event) =>
            onUpdate({
              action:
                event.target
                  .value as OptionAction,
            })
          }
          className={`h-8 rounded-md border border-slate-700 bg-slate-950 px-2 font-mono text-[11px] font-semibold uppercase outline-none ${actionClass}`}
        >
          <option value="buy">
            BUY
          </option>
          <option value="sell">
            SELL
          </option>
        </select>

        <span className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 font-mono text-[11px] uppercase text-slate-300">
          {leg.type}
        </span>

        <span className="font-mono text-xs font-semibold text-slate-100">
          {leg.strike.toFixed(0)}
        </span>

        <span className="font-mono text-[10px] text-slate-500">
          {leg.expiry}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <label
            htmlFor={`leg-quantity-${leg.id}`}
            className="text-[9px] uppercase tracking-wider text-slate-600"
          >
            Qty
          </label>

          <input
            id={`leg-quantity-${leg.id}`}
            type="number"
            min={1}
            step={1}
            value={leg.quantity}
            onChange={(event) => {
              const quantity =
                Number(
                  event.target
                    .value,
                );

              onUpdate({
                quantity:
                  Number.isFinite(
                    quantity,
                  ) &&
                  quantity > 0
                    ? Math.floor(
                        quantity,
                      )
                    : 1,
              });
            }}
            className="h-8 w-16 rounded-md border border-slate-700 bg-slate-950 px-2 text-right font-mono text-xs text-slate-200 outline-none focus:border-slate-500"
          />

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${leg.type} ${leg.strike} leg`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-800 text-slate-600 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-800 pt-3 sm:grid-cols-5">
        <Metric
          label="Premium"
          value={`$${leg.premium.toFixed(
            2,
          )}`}
        />

        <Metric
          label="Delta"
          value={leg.delta.toFixed(
            3,
          )}
        />

        <Metric
          label="Gamma"
          value={leg.gamma.toFixed(
            3,
          )}
        />

        <Metric
          label="Theta"
          value={leg.theta.toFixed(
            3,
          )}
        />

        <Metric
          label="Vega"
          value={leg.vega.toFixed(
            3,
          )}
        />
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 font-mono text-[11px] text-slate-300">
        {value}
      </div>
    </div>
  );
}