"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getMarketChart,
  getMarketQuotes,
} from "@/lib/api";

import type {
  ChartTimeframe,
} from "@/types/trading";

export function useMarketQuotes() {
  return useQuery({
    queryKey: ["market", "quotes"],
    queryFn: getMarketQuotes,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function useMarketChart(
  symbol: string,
  timeframe: ChartTimeframe = "1D",
) {
  return useQuery({
    queryKey: [
      "market",
      "chart",
      symbol,
      timeframe,
    ],
    queryFn: () =>
      getMarketChart(
        symbol,
        timeframe,
      ),
    enabled:
      symbol.trim().length > 0,
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });
}

export function useMarketData(
  symbol = "SPY",
  timeframe: ChartTimeframe = "1D",
) {
  const quotes =
    useMarketQuotes();

  const chart =
    useMarketChart(
      symbol,
      timeframe,
    );

  return {
    quotes: quotes.data ?? [],
    chart: chart.data ?? [],
    quotesQuery: quotes,
    chartQuery: chart,
    isLoading:
      quotes.isLoading ||
      chart.isLoading,
    isFetching:
      quotes.isFetching ||
      chart.isFetching,
    isError:
      quotes.isError ||
      chart.isError,
    error:
      quotes.error ??
      chart.error ??
      null,
    refetch: async () => {
      await Promise.all([
        quotes.refetch(),
        chart.refetch(),
      ]);
    },
  };
}