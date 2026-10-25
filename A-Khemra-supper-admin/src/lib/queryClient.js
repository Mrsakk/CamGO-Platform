import { QueryClient } from "@tanstack/react-query";

export const MAX_CACHE_AGE = 1000 * 60 * 60 * 24; // 24 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default fresh window
      gcTime: MAX_CACHE_AGE,     // Keep in memory/cache for 24 hours
      refetchOnWindowFocus: false, // Prevent jarring refetches while filling forms
      refetchOnReconnect: true,
      networkMode: "offlineFirst",
      retry: (failureCount, error) => {
        // Do not retry 4xx client errors
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
    mutations: {
      networkMode: "offlineFirst",
    },
  },
});
