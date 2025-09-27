import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, Minimize2, Maximize2, Trash2, Download } from 'lucide-react';
import { DebugBus, type DebugEvent } from '@/debug/DebugBus';

interface DebugState {
  events: DebugEvent[];
  isVisible: boolean;
  isMinimized: boolean;
  autoRefresh: boolean;
}

export function UnifiedDebugPanel() {
  const [state, setState] = useState<DebugState>({
    events: [],
    isVisible: false,
    isMinimized: false,
    autoRefresh: true
  });

  // Check if debug mode should be enabled
  const shouldShow = () => {
    const url = new URL(window.location.href);
    return url.searchParams.has('debug') || 
           url.hash === '#debug' || 
           localStorage.getItem('SHOW_DEBUG_PANEL') === 'true';
  };

  useEffect(() => {
    if (!shouldShow()) return;

    // Update events
    const updateEvents = () => {
      if (state.autoRefresh) {
        setState(prev => ({ ...prev, events: [...DebugBus.get()] }));
      }
    };

    const interval = setInterval(updateEvents, 1000);
    updateEvents(); // Initial load

    // Keyboard shortcuts - use a different combination to avoid conflicts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Shift+F12 for debug toggle (less likely to conflict)
      if (e.shiftKey && e.key === 'F12') {
        e.preventDefault();
        setState(prev => ({ ...prev, isVisible: !prev.isVisible }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.autoRefresh]);

  // Early return if debug should not be shown
  if (!shouldShow()) return null;

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
    return JSON.stringify(detail, null, 2);
  };

  const handleClearEvents = () => {
    DebugBus.clear();
    setState(prev => ({ ...prev, events: [] }));
  };

  const handleDownloadLogs = () => {
    const logs = state.events.map(event => ({
      time: formatTime(event.ts),
      source: event.source,
      detail: event.detail
    }));
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addTestEvent = (type: string) => {
    DebugBus.add({
      ts: Date.now(),
      source: `test-${type}`,
      detail: { 
        message: `Test ${type} event`, 
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    });
  };

  if (state.isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setState(prev => ({ ...prev, isMinimized: false, isVisible: true }))}
          className="bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug ({state.events.length})
          <Maximize2 className="w-3 h-3 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setState(prev => ({ ...prev, isVisible: !prev.isVisible }))}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          size="sm"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug ({state.events.length})
        </Button>
      </div>

      {/* Debug Panel */}
      {state.isVisible && (
        <div className="fixed bottom-16 right-4 w-[500px] max-h-[70vh] bg-white border border-gray-300 rounded-lg shadow-2xl z-[9998] overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4" />
              <span className="font-medium">Debug Panel</span>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {state.events.length} events
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, isMinimized: true, isVisible: false }))}
                className="h-6 w-6 p-0 text-white hover:bg-blue-500"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, isVisible: false }))}
                className="h-6 w-6 p-0 text-white hover:bg-blue-500"
              >
                ×
              </Button>
            </div>
          </div>

          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="controls">Controls</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="m-0">
              <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={state.autoRefresh}
                      onChange={(e) => setState(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                    />
                    Auto-refresh
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadLogs}>
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearEvents}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[50vh] p-3">
                {state.events.length === 0 ? (
                  <div className="text-gray-500 italic text-center py-8">
                    No events yet. Try navigating or interacting with the page.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.events.slice().reverse().map((event, idx) => (
                      <div key={idx} className="border border-gray-200 rounded p-2 bg-gray-50">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-mono text-blue-600">
                            {formatTime(event.ts)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {event.source}
                          </Badge>
                        </div>
                        {event.detail && (
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border overflow-x-auto">
                            {formatDetail(event.detail)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="system" className="m-0">
              <div className="p-3 space-y-3 max-h-[50vh] overflow-y-auto">
                <div className="space-y-2 text-sm">
                  <div><strong>URL:</strong> {window.location.href}</div>
                  <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                  <div><strong>Scroll Y:</strong> {Math.round(window.scrollY)}</div>
                  <div><strong>Viewport:</strong> {window.innerWidth}x{window.innerHeight}</div>
                  <div><strong>Local Storage Keys:</strong> {Object.keys(localStorage).filter(k => k.includes('DEBUG') || k.includes('sb-')).join(', ') || 'None'}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="controls" className="m-0">
              <div className="p-3 space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Keyboard Shortcuts:</strong>
                  <br />• Shift + F12: Toggle debug panel
                  <br />• Add ?debug=1 to URL to enable debug mode
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Test Events:</div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => addTestEvent('navigation')}>
                      Navigation
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addTestEvent('reload')}>
                      Reload
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => addTestEvent('interaction')}>
                      Interaction
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Debug Tools:</div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => window.open('/_diag', '_blank')}>
                      Diagnostics
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => console.table(state.events)}>
                      Log to Console
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
}