import { DebugBus } from './DebugBus';
import { isDebug } from './flag';

let isInstalled = false;

export function installNavigationDebug() {
  if (!isDebug() || isInstalled) return;
  isInstalled = true;

  DebugBus.add({
    ts: Date.now(),
    source: 'navigation-debug',
    detail: { status: 'installing' }
  });

  // Log initial navigation type
  const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (navEntries.length > 0) {
    const nav = navEntries[0];
    DebugBus.add({
      ts: Date.now(),
      source: 'navigation',
      detail: { 
        type: nav.type, 
        loadEventEnd: nav.loadEventEnd,
        domContentLoadedEventEnd: nav.domContentLoadedEventEnd
      }
    });
  }

  // Track page unload events
  window.addEventListener('beforeunload', (e) => {
    DebugBus.add({
      ts: Date.now(),
      source: 'beforeunload',
      detail: { url: window.location.href }
    });
  });

  window.addEventListener('pagehide', (e) => {
    DebugBus.add({
      ts: Date.now(),
      source: 'pagehide',
      detail: { 
        persisted: e.persisted,
        url: window.location.href 
      }
    });
  });

  // Monkey-patch history methods
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    DebugBus.add({
      ts: Date.now(),
      source: 'history.pushState',
      detail: { 
        url: args[2],
        state: args[0] 
      }
    });
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    DebugBus.add({
      ts: Date.now(),
      source: 'history.replaceState',
      detail: { 
        url: args[2],
        state: args[0] 
      }
    });
    return originalReplaceState.apply(this, args);
  };

  // Monkey-patch location.reload
  const originalReload = window.location.reload;
  window.location.reload = function(...args) {
    const stack = new Error().stack;
    DebugBus.add({
      ts: Date.now(),
      source: 'location.reload',
      detail: { 
        stack: stack?.split('\n').slice(0, 5).join('\n'),
        args 
      }
    });
    return originalReload.apply(this, args);
  };

  // Track visibility changes
  document.addEventListener('visibilitychange', () => {
    DebugBus.add({
      ts: Date.now(),
      source: 'visibilitychange',
      detail: { 
        visibilityState: document.visibilityState,
        hidden: document.hidden 
      }
    });
  });

  // Track focus events
  window.addEventListener('focus', () => {
    DebugBus.add({
      ts: Date.now(),
      source: 'window.focus',
      detail: { url: window.location.href }
    });
  });

  window.addEventListener('blur', () => {
    DebugBus.add({
      ts: Date.now(),
      source: 'window.blur',
      detail: { url: window.location.href }
    });
  });

  // Monkey-patch fetch for auth issues
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request)?.url || 'unknown';
    const method = typeof args[1] === 'object' ? args[1]?.method || 'GET' : 'GET';
    
    return originalFetch.apply(this, args).then(response => {
      if (response.status === 401 || response.status === 419) {
        DebugBus.add({
          ts: Date.now(),
          source: 'fetch:auth-issue',
          detail: { 
            url,
            method,
            status: response.status 
          }
        });
      }
      return response;
    }).catch(error => {
      DebugBus.add({
        ts: Date.now(),
        source: 'fetch:error',
        detail: { 
          url,
          method,
          error: error.message 
        }
      });
      throw error;
    });
  };

  DebugBus.add({
    ts: Date.now(),
    source: 'navigation-debug',
    detail: { status: 'installed' }
  });
}