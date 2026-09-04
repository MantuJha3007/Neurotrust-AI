"use client";

import type {
  OptionContract,
} from "@/types/options";

import {
  GreeksCell,
} from "@/components/options/greeks-cell";

interface OptionsChainRowProps {
  call: OptionContract;
  put: OptionContract;
  underlyingPrice: number;
  onSelect: (
    contract: OptionContract,
  ) => void;
}

function formatNumber(
  value: number,
): string {
  return value.toLocaleString(
    "en-US",
  );
}

function isAtTheMoney(
  strike: number,
  underlyingPrice: number,
): boolean {
  return (
    Math.abs(
      strike -
        underlyingPrice,
    ) < 2.5
  );
}

function ContractSide({
  contract,
  onSelect,
}: {
  contract: OptionContract;
  onSelect: (
    contract: OptionContract,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-[72px_72px_72px_64px_64px_64px] items-center gap-2">
      <button
        type="button"
        onClick={() =>
          onSelect(contract)
        }
        className="rounded border border-transparent px-1 py-1 text-right font-mono text-[11px] font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
      >
        {contract.bid.toFixed(
          2,
        )}
      </button>

      <button
        type="button"
        onClick={() =>
          onSelect(contract)
        }
        className="rounded border border-transparent px-1 py-1 text-right font-mono text-[11px] font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
      >
        {contract.ask.toFixed(
          2,
        )}
      </button>

      <div className="text-right font-mono text-[11px] text-slate-400">
        {formatNumber(
          contract.volume,
        )}
      </div>

      <GreeksCell
        label="Δ"
        value={contract.delta}
        precision={2}
      />

      <GreeksCell
        label="Γ"
        value={contract.gamma}
        precision={3}
      />

      <GreeksCell
        label="IV"
        value={
          contract.impliedVolatility *
          100
        }
        suffix="%"
        precision={1}
      />
    </div>
  );
}

export function OptionsChainRow({
  call,
  put,
  underlyingPrice,
  onSelect,
}: OptionsChainRowProps) {
  const atm =
    isAtTheMoney(
      call.strike,
      underlyingPrice,
    );

  return (
    <div
      className={`grid min-w-[920px] grid-cols-[1fr_80px_1fr] items-center gap-3 border-b border-slate-900 px-3 py-2 transition hover:bg-slate-900/70 ${
        atm
          ? "bg-slate-900/80"
          : ""
      }`}
    >
      <ContractSide
        contract={call}
        onSelect={onSelect}
      />

      <div className="flex flex-col items-center justify-center">
        <span
          className={`font-mono text-xs font-semibold ${
            atm
              ? "text-amber-400"
              : "text-slate-300"
          }`}
        >
          {call.strike.toFixed(
            0,
          )}
        </span>

        {atm ? (
          <span className="text-[8px] font-semibold uppercase tracking-wider text-amber-500">
            ATM
          </span>
        ) : null}
      </div>

      <ContractSide
        contract={put}
        onSelect={onSelect}
      />
    </div>
  );
}