import { isDebug } from './flag';

// Debug event bus for tracking hard reload causes
export type DebugEvent = {
  ts: number;
  source: string;
  detail?: any;
};

class DebugEventBus {
  private maxEvents = 50;

  add(event: DebugEvent) {
    if (!this.isEnabled()) return;
    
    const events = this.get();
    events.push({
      ...event,
      ts: event.ts || Date.now()
    });
    
    // Keep only the latest events
    if (events.length > this.maxEvents) {
      events.splice(0, events.length - this.maxEvents);
    }
    
    (window as any).__DEBUG_EVENTS = events;
    
    // Optional console debug
    if (this.isEnabled()) {
      console.debug(`[DEBUG-BUS] ${event.source}`, event.detail);
    }
  }

  get(): DebugEvent[] {
    return (window as any).__DEBUG_EVENTS || [];
  }

  clear() {
    (window as any).__DEBUG_EVENTS = [];
  }

  isEnabled(): boolean {
    return isDebug();
  }
}

// Initialize global state
if (typeof window !== 'undefined') {
  (window as any).__DEBUG_EVENTS = (window as any).__DEBUG_EVENTS || [];
  (window as any).__DEBUG_FLAG = import.meta.env.VITE_DEBUG_HARDRELOAD === '1';
  
  // Expose for console fallback
  (window as any).DebugBus = new DebugEventBus();
  
  // Console fallback message
  if (isDebug()) {
    console.log('[DebugKit] Debug mode enabled. Use window.__DEBUG_EVENTS and window.DebugBus.add(...)');
  }
}

export const DebugBus = new DebugEventBus();
