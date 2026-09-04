"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getOptionChain,
} from "@/lib/api";

import {
  useOptionsStore,
} from "@/stores/options-store";

export function useOptionsChain(
  symbol?: string,
  expiry?: string,
) {
  const storeSymbol =
    useOptionsStore(
      (state) =>
        state.selectedSymbol,
    );

  const storeExpiry =
    useOptionsStore(
      (state) =>
        state.selectedExpiry,
    );

  const activeSymbol =
    (
      symbol ??
      storeSymbol
    ).trim().toUpperCase();

  const activeExpiry =
    expiry ?? storeExpiry;

  const query =
    useQuery({
      queryKey: [
        "options",
        "chain",
        activeSymbol,
        activeExpiry,
      ],

      queryFn: () =>
        getOptionChain(
          activeSymbol,
          activeExpiry,
        ),

      enabled:
        activeSymbol.length > 0,

      staleTime: 2_000,

      refetchInterval: 5_000,

      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      query.data ?? null,

    chain:
      query.data ?? null,

    calls:
      query.data?.calls ?? [],

    puts:
      query.data?.puts ?? [],

    underlyingPrice:
      query.data
        ?.underlyingPrice ??
      null,

    isLoading:
      query.isLoading,

    isFetching:
      query.isFetching,

    isError:
      query.isError,

    error:
      query.error ?? null,

    refetch:
      query.refetch,
  };
}