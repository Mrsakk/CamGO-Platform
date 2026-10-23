import { QueryClient } from "@tanstack/react-query";

// 24 hours in milliseconds (matches localStorage persister maxAge)
export const MAX_CACHE_AGE = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: MAX_CACHE_AGE,     // 24 hours (garbage collection >= maxAge)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default queryClient;
