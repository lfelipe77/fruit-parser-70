import React, { useState, useEffect } from 'react';
import { DebugBus, type DebugEvent } from './DebugBus';

export function DebugOverlay() {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!(window as any).__DEBUG_FLAG) return null;

    // Update events periodically
    const interval = setInterval(() => {
      setEvents([...DebugBus.get()]);
    }, 500);

    // Keyboard toggle Alt+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!(window as any).__DEBUG_FLAG || !isVisible) return null;

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    }) + '.' + String(date.getMilliseconds()).padStart(3, '0');
  };

  const formatDetail = (detail: any) => {
    if (!detail) return '';
    if (typeof detail === 'string') return detail;
    return JSON.stringify(detail, null, 0).slice(0, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-[40vh] bg-black/90 text-white text-xs font-mono border border-gray-600 rounded shadow-lg z-[9999] overflow-hidden">
      <div className="bg-gray-800 px-3 py-2 border-b border-gray-600 flex justify-between items-center">
        <span className="font-semibold">Hard Reload Debug (Alt+D)</span>
        <div className="flex gap-2">
          <button 
            onClick={() => DebugBus.clear()}
            className="text-red-400 hover:text-red-300"
            title="Clear events"
          >
            Clear
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-300"
            title="Hide (Alt+D to toggle)"
          >
            ×
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(40vh-3rem)] p-2">
        {events.length === 0 ? (
          <div className="text-gray-500 italic">No events yet...</div>
        ) : (
          <div className="space-y-1">
            {events.slice().reverse().map((event, idx) => (
              <div key={idx} className="break-words">
                <span className="text-blue-400">[{formatTime(event.ts)}]</span>{' '}
                <span className="text-yellow-400">{event.source}</span>
                {event.detail && (
                  <div className="text-gray-300 ml-4 mt-1">
                    {formatDetail(event.detail)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}