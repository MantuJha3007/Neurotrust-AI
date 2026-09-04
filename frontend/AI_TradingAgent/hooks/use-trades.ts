"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createOrder,
  getTrades,
} from "@/lib/api";

import type {
  OrderRequest,
} from "@/types/trading";

export function useTrades() {
  const query =
    useQuery({
      queryKey: [
        "trades",
      ],
      queryFn:
        getTrades,
      staleTime: 3_000,
      refetchInterval: 5_000,
      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      query.data ?? [],
    trades:
      query.data ?? [],
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

export function useCreateOrder() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      order: OrderRequest,
    ) =>
      createOrder(order),

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: [
            "trades",
          ],
        },
      );

      await queryClient.invalidateQueries(
        {
          queryKey: [
            "portfolio",
          ],
        },
      );
    },
  });
}