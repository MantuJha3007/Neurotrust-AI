"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSystemStatus } from "@/lib/api";

export function useSystemStatus() {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["system", "status"],
    queryFn: async () => {
      const t0 = performance.now();
      try {
        const result = await getSystemStatus();
        setLatencyMs(Math.round(performance.now() - t0));
        return result;
      } catch (err) {
        setLatencyMs(null);
        throw err;
      }
    },
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? null,
    system: query.data ?? null,
    latencyMs,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error ?? null,
    refetch: query.refetch,
  };
}
