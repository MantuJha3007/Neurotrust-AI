"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getOptionContract,
} from "@/lib/api";

export function useOptionContract(
  contractSymbol: string,
) {
  const normalizedSymbol =
    contractSymbol.trim();

  const query =
    useQuery({
      queryKey: [
        "options",
        "contract",
        normalizedSymbol,
      ],

      queryFn: () =>
        getOptionContract(
          normalizedSymbol,
        ),

      enabled:
        normalizedSymbol.length > 0,

      staleTime: 2_000,

      refetchInterval: 5_000,

      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      query.data ?? null,

    quote:
      query.data ?? null,

    contract:
      query.data?.contract ??
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