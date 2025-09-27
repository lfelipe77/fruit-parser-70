import { useEffect, useRef, useState } from 'react';

interface UseVisibilityRefreshOptions {
  refreshInterval?: number;
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
}

export function useVisibilityRefresh({ 
  refreshInterval = 30000, 
  onRefresh, 
  enabled = true 
}: UseVisibilityRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(() => document.visibilityState === 'visible');
  
  // Clear any existing interval
  const clearRefreshInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start interval if visible and enabled
  const startRefreshInterval = () => {
    if (!enabled || !isVisible) return;
    
    clearRefreshInterval();
    intervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        onRefresh();
      }
    }, refreshInterval);
  };

  useEffect(() => {
    if (!enabled) {
      clearRefreshInterval();
      return;
    }

    // Handle visibility changes
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      setIsVisible(visible);
      
      if (visible) {
        // Tab became visible - do immediate refresh and restart timer
        onRefresh();
        startRefreshInterval();
      } else {
        // Tab became hidden - stop polling
        clearRefreshInterval();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start initial interval if visible
    if (isVisible) {
      startRefreshInterval();
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearRefreshInterval();
    };
  }, [enabled, refreshInterval, isVisible, onRefresh]);

  return { isVisible };
}