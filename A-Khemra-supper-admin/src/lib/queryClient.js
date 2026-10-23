import { QueryClient } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1e3 * 60 * 5,
      // 5 minutes fresh
      gcTime: 1e3 * 60 * 15,
      // 15 minutes garbage collection
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});
export {
  queryClient
};
