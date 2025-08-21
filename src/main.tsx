
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import { unregisterServiceWorkersAndClearCaches, wireGlobalUnhandledHandlers } from "@/lib/safeBoot";

// Initialize safe boot procedures
try {
  wireGlobalUnhandledHandlers();
  unregisterServiceWorkersAndClearCaches();
} catch (e) {
  console.warn("Safe boot procedures failed:", e);
}

// Safe render with fallback
function safeRender() {
  try {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }

    const root = createRoot(rootElement);
    
    root.render(
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
    
    // Fallback UI
    const el = document.getElementById("root");
    if (el) {
      el.innerHTML = `
        <div style="padding:16px;font-family:system-ui">
          <h1>Ganhavel</h1>
          <p>Algo deu errado ao iniciar. Recarregue a página.</p>
          <button onclick="window.location.reload()" style="margin-top:8px;padding:8px 16px;background:#007bff;color:white;border:none;border-radius:4px;cursor:pointer">
            Recarregar
          </button>
        </div>`;
    }
  }
}

// Check if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', safeRender);
} else {
  safeRender();
}
