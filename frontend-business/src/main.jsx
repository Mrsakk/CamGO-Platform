import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./locales/i18n";
import "./index.css";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { initWebVitals } from "./lib/vitals";

// Initialize Real User Monitoring (Web Vitals)
initWebVitals();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
