export async function unregisterServiceWorkersAndClearCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister().catch(() => {})));
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (e) {
    // non-fatal
    console.warn("SW/cache cleanup failed:", e);
  }
}

export function wireGlobalUnhandledHandlers() {
  window.addEventListener("error", (e) => {
    console.error("window.onerror", e.error || e.message || e);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("unhandledrejection", e.reason);
  });
}