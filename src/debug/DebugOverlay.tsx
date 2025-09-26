import React, { useState, useEffect } from 'react';
import { DebugBus, type DebugEvent } from './DebugBus';
import { isDebug } from './flag';

export function DebugOverlay() {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Early return if debug is not enabled
  if (typeof window === 'undefined' || !isDebug()) {
    return null;
  }

  useEffect(() => {
    // Update events periodically
    const interval = setInterval(() => {
      setEvents([...DebugBus.get()]);
    }, 500);

    // Enhanced keyboard toggles - avoid Chrome shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.altKey && e.key === 'd') || (e.shiftKey && e.altKey && e.key === 'd')) {
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
    <>
      {/* Always visible debug button */}
      <button
        onClick={() => setIsVisible(prev => !prev)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg z-[9998] text-sm font-mono flex items-center gap-1 transition-all"
        title="Toggle Debug Overlay (Ctrl+Alt+D or Shift+Alt+D)"
      >
        🐞 Debug
      </button>

      {/* Debug overlay */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 w-96 max-h-[50vh] bg-black/95 text-white text-xs font-mono border border-gray-600 rounded shadow-lg z-[9999] overflow-hidden">
          <div className="bg-gray-800 px-3 py-2 border-b border-gray-600 flex justify-between items-center">
            <span className="font-semibold">Hard Reload Debug</span>
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
                title="Hide (Ctrl+Alt+D or Shift+Alt+D)"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 px-3 py-1 text-xs text-gray-400 border-b border-gray-700">
            Shortcuts: Ctrl+Alt+D, Shift+Alt+D | URL: ?debug=1 or #debug
          </div>
          
          <div className="overflow-y-auto max-h-[calc(50vh-5rem)] p-2">
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
      )}
    </>
  );
}