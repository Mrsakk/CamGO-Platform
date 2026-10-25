import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createIdbPersister } from "./lib/persister";
import { queryClient, MAX_CACHE_AGE } from "./lib/queryClient";
import "./locales/i18n";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { initWebVitals } from "./lib/vitals";

// Initialize Real User Monitoring (Web Vitals)
initWebVitals();

// IndexedDB persister with localStorage & memory fallbacks
const idbPersister = createIdbPersister("CAMGO_TRAVEL_CACHE");

const persistOptions = {
  persister: idbPersister,
  maxAge: MAX_CACHE_AGE, // 24 hours
  buster: "kmt-perf-v2",
  dehydrateOptions: {
    // Only persist public non-sensitive queries; NEVER persist user/auth/tokens
    shouldDehydrateQuery: (query) => {
      if (query.state.status !== "success" || !Array.isArray(query.queryKey)) {
        return false;
      }
      const rootKey = query.queryKey[0];
      const sensitiveKeys = ["user", "auth", "token", "profile", "password"];
      if (sensitiveKeys.includes(rootKey)) {
        return false;
      }
      const allowedRoots = ["home", "categories", "provinces", "destinations", "events", "blogs"];
      return allowedRoots.includes(rootKey);
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
