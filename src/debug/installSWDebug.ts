import { DebugBus } from './DebugBus';

let isInstalled = false;

export function installSWDebug() {
  if (!DebugBus.isEnabled() || isInstalled) return;
  isInstalled = true;

  DebugBus.add({
    ts: Date.now(),
    source: 'sw-debug',
    detail: { status: 'installing' }
  });

  // Track service worker events
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      DebugBus.add({
        ts: Date.now(),
        source: 'sw',
        detail: { event: 'controllerchange' }
      });
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      DebugBus.add({
        ts: Date.now(),
        source: 'sw',
        detail: { event: 'message', data: event.data }
      });
    });

    // Check for existing registration
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        DebugBus.add({
          ts: Date.now(),
          source: 'sw',
          detail: { 
            event: 'existing-registration',
            scope: registration.scope,
            state: registration.active?.state
          }
        });

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          DebugBus.add({
            ts: Date.now(),
            source: 'sw',
            detail: { event: 'updatefound' }
          });

          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              DebugBus.add({
                ts: Date.now(),
                source: 'sw',
                detail: { 
                  event: 'statechange', 
                  state: newWorker.state 
                }
              });
            });
          }
        });
      }
    });
  }

  // Kill switch for service worker
  if (location.search.includes('nosw=1') && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(r => r.unregister());
      DebugBus.add({
        ts: Date.now(),
        source: 'sw',
        detail: { event: 'unregister', count: registrations.length }
      });
    });
  }

  DebugBus.add({
    ts: Date.now(),
    source: 'sw-debug',
    detail: { status: 'installed' }
  });
}

// Safe reload guard function
export function safeReload(reason: string) {
  const stack = new Error().stack;
  DebugBus.add({
    ts: Date.now(),
    source: 'sw-reload-blocked',
    detail: { 
      reason, 
      stack: stack?.split('\n').slice(0, 5).join('\n'),
      debugMode: DebugBus.isEnabled()
    }
  });
  
  // Only auto-reload in production if enough time has passed
  const pageLoadTime = performance.timing?.loadEventEnd || Date.now();
  const timeSinceLoad = Date.now() - pageLoadTime;
  
  if (!DebugBus.isEnabled() && timeSinceLoad > 60000) {
    console.log('[SW] Auto-reloading after 60s grace period');
    window.location.reload();
  } else {
    console.log('[SW] Reload blocked in debug mode or too soon after load');
  }
}