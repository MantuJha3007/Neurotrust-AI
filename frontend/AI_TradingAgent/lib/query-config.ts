import type {
  QueryClient,
} from "@tanstack/react-query";

export const queryDefaults = {
  staleTime: 5_000,
  gcTime: 5 * 60 * 1_000,
  retry: 2,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export function configureQueryClient(
  queryClient: QueryClient,
): void {
  queryClient.setDefaultOptions({
    queries: {
      staleTime: queryDefaults.staleTime,
      gcTime: queryDefaults.gcTime,
      retry: queryDefaults.retry,
      refetchOnWindowFocus:
        queryDefaults.refetchOnWindowFocus,
      refetchOnReconnect:
        queryDefaults.refetchOnReconnect,
    },
    mutations: {
      retry: 0,
    },
  });
}