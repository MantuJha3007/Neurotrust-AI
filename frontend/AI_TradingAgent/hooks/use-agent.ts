"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getAgent,
  pauseAgent,
  resumeAgent,
} from "@/lib/api";

export function useAgent() {
  const query =
    useQuery({
      queryKey: [
        "agent",
        "status",
      ],
      queryFn:
        getAgent,
      staleTime: 2_000,
      refetchInterval: 5_000,
      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      query.data ?? null,
    agent:
      query.data ?? null,
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

export function usePauseAgent() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      pauseAgent,

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: [
            "agent",
            "status",
          ],
        },
      );
    },
  });
}

export function useResumeAgent() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      resumeAgent,

    onSuccess: async () => {
      await queryClient.invalidateQueries(
        {
          queryKey: [
            "agent",
            "status",
          ],
        },
      );
    },
  });
}