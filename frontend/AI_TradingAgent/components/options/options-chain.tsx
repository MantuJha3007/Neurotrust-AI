"use client";

import {
  useOptionsChain,
} from "@/hooks/use-options-chain";

import {
  useOptionsStore,
} from "@/stores/options-store";

import {
  OptionsChainHeader,
} from "@/components/options/options-chain-header";

import {
  OptionsChainRow,
} from "@/components/options/options-chain-row";

import {
  CardSkeleton,
} from "@/components/loading/card-skeleton";

import {
  ErrorState,
} from "@/components/states/error-state";

import {
  EmptyState,
} from "@/components/states/empty-state";

import type {
  OptionContract,
} from "@/types/options";

export function OptionsChain() {
  const symbol =
    useOptionsStore(
      (state) =>
        state.selectedSymbol,
    );

  const expiry =
    useOptionsStore(
      (state) =>
        state.selectedExpiry,
    );

  const setExpiry =
    useOptionsStore(
      (state) =>
        state.setSelectedExpiry,
    );

  const setContract =
    useOptionsStore(
      (state) =>
        state.setSelectedContract,
    );

  const {
    chain,
    calls,
    puts,
    underlyingPrice,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } =
    useOptionsChain(
      symbol,
      expiry,
    );

  const handleSelect = (
    contract: OptionContract,
  ) => {
    setContract(
      contract,
    );
  };

  if (isLoading) {
    return (
      <CardSkeleton
        lines={7}
        className="min-h-[500px]"
      />
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Options chain unavailable"
        message={
          error instanceof Error
            ? error.message
            : "Unable to load the options chain."
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (
    !chain ||
    calls.length === 0 ||
    puts.length === 0
  ) {
    return (
      <EmptyState
        title="No options contracts"
        message={`No contracts are currently available for ${symbol}.`}
      />
    );
  }

  const rowCount =
    Math.min(
      calls.length,
      puts.length,
    );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <OptionsChainHeader
        symbol={symbol}
        underlyingPrice={
          underlyingPrice
        }
        expiry={
          chain.expiry
        }
        isFetching={
          isFetching
        }
        onRefresh={() => {
          void refetch();
        }}
        onExpiryChange={
          setExpiry
        }
      />

      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[1fr_80px_1fr] gap-3 border-b border-slate-800 bg-slate-900/80 px-3 py-2">
            <div>
              <div className="mb-1 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-emerald-500">
                Calls
              </div>

              <div className="grid grid-cols-[72px_72px_72px_64px_64px_64px] justify-end gap-2 text-right text-[8px] uppercase tracking-wider text-slate-600">
                <span>Bid</span>
                <span>Ask</span>
                <span>Vol</span>
                <span>Delta</span>
                <span>Gamma</span>
                <span>IV</span>
              </div>
            </div>

            <div className="flex items-end justify-center pb-1 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
              Strike
            </div>

            <div>
              <div className="mb-1 text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-red-500">
                Puts
              </div>

              <div className="grid grid-cols-[72px_72px_72px_64px_64px_64px] gap-2 text-right text-[8px] uppercase tracking-wider text-slate-600">
                <span>Bid</span>
                <span>Ask</span>
                <span>Vol</span>
                <span>Delta</span>
                <span>Gamma</span>
                <span>IV</span>
              </div>
            </div>
          </div>

          {Array.from(
            { length: rowCount },
            (_, index) => (
              <OptionsChainRow
                key={`${calls[index].contractSymbol}-${puts[index].contractSymbol}`}
                call={calls[index]}
                put={puts[index]}
                underlyingPrice={
                  chain.underlyingPrice
                }
                onSelect={
                  handleSelect
                }
              />
            ),
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 bg-slate-900/50 px-4 py-2 text-[10px] text-slate-600">
        <span>
          {rowCount} strikes
        </span>

        <span className="font-mono">
          Updated{" "}
          {new Date(
            chain.timestamp,
          ).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}