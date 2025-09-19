// Throttling utilities to prevent fetch storms

export function createThrottledFetch(fetchFn: () => Promise<void>, delay: number = 300) {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  let inFlight = false;

  return async () => {
    const now = Date.now();
    
    // If already in flight, skip
    if (inFlight) {
      console.log('[ThrottledFetch] Skipping - already in flight');
      return;
    }

    // Clear any pending delayed call
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      // Execute immediately
      lastCall = now;
      inFlight = true;
      try {
        await fetchFn();
      } finally {
        inFlight = false;
      }
    } else {
      // Delay execution
      const remainingDelay = delay - timeSinceLastCall;
      timeoutId = setTimeout(async () => {
        lastCall = Date.now();
        inFlight = true;
        try {
          await fetchFn();
        } finally {
          inFlight = false;
        }
        timeoutId = null;
      }, remainingDelay);
    }
  };
}

export function createCoalescingFetch(fetchFn: () => Promise<void>) {
  let inFlight = false;
  let pendingCall = false;

  return async () => {
    if (inFlight) {
      pendingCall = true;
      return;
    }

    inFlight = true;
    try {
      await fetchFn();
      
      // If another call was requested while we were fetching, do one more
      if (pendingCall) {
        pendingCall = false;
        await fetchFn();
      }
    } finally {
      inFlight = false;
    }
  };
}