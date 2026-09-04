"use client";

import {
  useMemo,
} from "react";

import {
  Plus,
  Trash2,
} from "lucide-react";

import {
  useOptionsStore,
} from "@/stores/options-store";

import {
  calculateStrategyRisk,
} from "@/lib/options/strategy-normalizer";

import {
  StrategyLeg,
} from "@/components/options/strategy-leg";

import type {
  OptionLeg,
} from "@/types/options";

function createLegId(): string {
  return `leg-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function StrategyBuilder() {
  const selectedContract =
    useOptionsStore(
      (state) =>
        state.selectedContract,
    );

  const legs =
    useOptionsStore(
      (state) =>
        state.strategyLegs,
    );

  const addLeg =
    useOptionsStore(
      (state) =>
        state.addLeg,
    );

  const removeLeg =
    useOptionsStore(
      (state) =>
        state.removeLeg,
    );

  const updateLeg =
    useOptionsStore(
      (state) =>
        state.updateLeg,
    );

  const clearLegs =
    useOptionsStore(
      (state) =>
        state.clearLegs,
    );

  const risk = useMemo(
    () =>
      calculateStrategyRisk(
        legs,
      ),
    [legs],
  );

  const addSelectedContract =
    () => {
      if (
        !selectedContract
      ) {
        return;
      }

      const newLeg: OptionLeg =
        {
          id: createLegId(),
          contractSymbol:
            selectedContract.contractSymbol,
          symbol:
            selectedContract.symbol,
          type:
            selectedContract.type,
          action: "buy",
          quantity: 1,
          strike:
            selectedContract.strike,
          expiry:
            selectedContract.expiry,
          premium:
            (
              selectedContract.bid +
              selectedContract.ask
            ) / 2,
          delta:
            selectedContract.delta,
          gamma:
            selectedContract.gamma,
          theta:
            selectedContract.theta,
          vega:
            selectedContract.vega,
          impliedVolatility:
            selectedContract.impliedVolatility,
        };

      addLeg(newLeg);
    };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Strategy Builder
          </h2>

          <p className="mt-1 text-[10px] text-slate-600">
            Build and validate a multi-leg
            options structure.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={
              addSelectedContract
            }
            disabled={
              !selectedContract
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-3 text-[10px] font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Add Selected
          </button>

          <button
            type="button"
            onClick={clearLegs}
            disabled={
              legs.length === 0
            }
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-800 px-3 text-[10px] font-semibold text-slate-600 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Clear
          </button>
        </div>
      </div>

      <div className="p-4">
        {legs.length === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/30 text-center">
            <p className="text-xs font-medium text-slate-400">
              No strategy legs
            </p>

            <p className="mt-1 max-w-sm text-[10px] text-slate-600">
              Select a contract from the
              options chain and click
              &quot;Add Selected&quot;.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {legs.map(
              (leg) => (
                <StrategyLeg
                  key={leg.id}
                  leg={leg}
                  onUpdate={(
                    updates,
                  ) =>
                    updateLeg(
                      leg.id,
                      updates,
                    )
                  }
                  onRemove={() =>
                    removeLeg(
                      leg.id,
                    )
                  }
                />
              ),
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryMetric
            label="Net Delta"
            value={risk.netDelta.toFixed(
              3,
            )}
          />

          <SummaryMetric
            label="Net Gamma"
            value={risk.netGamma.toFixed(
              3,
            )}
          />

          <SummaryMetric
            label="Net Theta"
            value={risk.netTheta.toFixed(
              3,
            )}
          />

          <SummaryMetric
            label="Net Vega"
            value={risk.netVega.toFixed(
              3,
            )}
          />
        </div>
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 font-mono text-sm font-semibold text-slate-200">
        {value}
      </div>
    </div>
  );
}