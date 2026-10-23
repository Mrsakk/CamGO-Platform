import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { queryClient, MAX_CACHE_AGE } from "./lib/queryClient";
import "./locales/i18n";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

// Synchronous localStorage persister for instant repeat-visit dehydration
const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "KMT_QUERY_PERSIST_CACHE",
});

const persistOptions = {
  persister: localStoragePersister,
  maxAge: MAX_CACHE_AGE, // 24 hours
  buster: "kmt-home-v1",
  dehydrateOptions: {
    // Only persist successful home queries so browser starts up instantly without bloat
    shouldDehydrateQuery: (query) => {
      return (
        query.state.status === "success" &&
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "home"
      );
    },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <App />
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
