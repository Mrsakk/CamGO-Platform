import { QueryClient } from "@tanstack/react-query";

// 24 hours in milliseconds
export const MAX_CACHE_AGE = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes default for lists
      gcTime: MAX_CACHE_AGE,     // 24 hours garbage collection
      networkMode: "offlineFirst",
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        // Do not retry 4xx client errors (e.g. 401, 403, 404)
        const status = error?.response?.status || error?.status;
        if (status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

export default queryClient;
