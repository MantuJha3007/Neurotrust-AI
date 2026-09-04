"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getPortfolio,
  getPositions,
} from "@/lib/api";

export function usePortfolio() {
  const portfolioQuery =
    useQuery({
      queryKey: [
        "portfolio",
      ],
      queryFn:
        getPortfolio,
      staleTime: 5_000,
      refetchInterval: 10_000,
      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      portfolioQuery.data ??
      null,
    portfolio:
      portfolioQuery.data ??
      null,
    isLoading:
      portfolioQuery.isLoading,
    isFetching:
      portfolioQuery.isFetching,
    isError:
      portfolioQuery.isError,
    error:
      portfolioQuery.error ??
      null,
    refetch:
      portfolioQuery.refetch,
  };
}

export function usePositions() {
  const positionsQuery =
    useQuery({
      queryKey: [
        "portfolio",
        "positions",
      ],
      queryFn:
        getPositions,
      staleTime: 5_000,
      refetchInterval: 10_000,
      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      positionsQuery.data ??
      [],
    positions:
      positionsQuery.data ??
      [],
    isLoading:
      positionsQuery.isLoading,
    isFetching:
      positionsQuery.isFetching,
    isError:
      positionsQuery.isError,
    error:
      positionsQuery.error ??
      null,
    refetch:
      positionsQuery.refetch,
  };
}

export function usePortfolioData() {
  const portfolio =
    usePortfolio();

  const positions =
    usePositions();

  return {
    portfolio:
      portfolio.portfolio,
    positions:
      positions.positions,
    isLoading:
      portfolio.isLoading ||
      positions.isLoading,
    isFetching:
      portfolio.isFetching ||
      positions.isFetching,
    isError:
      portfolio.isError ||
      positions.isError,
    error:
      portfolio.error ??
      positions.error ??
      null,
    refetch: async () => {
      await Promise.all([
        portfolio.refetch(),
        positions.refetch(),
      ]);
    },
  };
}