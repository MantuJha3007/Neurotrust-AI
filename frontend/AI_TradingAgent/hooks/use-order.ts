"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { createOrder } from "@/lib/api";
import type {
  OrderRequest,
  OrderResponse,
} from "@/types/trading";

export function useOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    OrderResponse,
    Error,
    OrderRequest
  >({
    mutationFn: createOrder,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["portfolio"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["trades"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["agent"],
        }),
      ]);
    },
  });

  return {
    submitOrder: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    result: mutation.data,
    reset: mutation.reset,
  };
}