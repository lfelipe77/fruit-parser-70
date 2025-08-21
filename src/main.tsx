import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { unregisterServiceWorkersAndClearCaches, wireGlobalUnhandledHandlers } from "@/lib/safeBoot";

wireGlobalUnhandledHandlers();
unregisterServiceWorkersAndClearCaches();

try {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <HashRouter>
          <App />
        </HashRouter>
      </GlobalErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("[BOOT] hard crash:", e);
  const el = document.getElementById("root");
  if (el) {
    el.innerHTML = `
      <div style="padding:16px;font-family:system-ui">
        <h1>Ganhavel</h1>
        <p>Algo deu errado ao iniciar. Recarregue a página.</p>
      </div>`;
  }
}
