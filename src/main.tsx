import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { unregisterServiceWorkersAndClearCaches, wireGlobalUnhandledHandlers } from "@/lib/safeBoot";

wireGlobalUnhandledHandlers();
unregisterServiceWorkersAndClearCaches();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </GlobalErrorBoundary>
  </React.StrictMode>
);
