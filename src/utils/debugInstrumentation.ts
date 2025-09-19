// Debug instrumentation helper for analyzing 30s jump behavior

export function logDebugSummary() {
  if (typeof window === 'undefined') return;
  
  const summary = [
    '==== 30S JUMP DEBUG SUMMARY ====',
    `Current URL: ${window.location.href}`,
    `Scroll position: ${window.scrollY}`,
    `Document ready state: ${document.readyState}`,
    `Navigation timing: ${JSON.stringify(performance.getEntriesByType('navigation')[0])}`,
    `Debug flag enabled: ${localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true'}`,
    '==============================='
  ];
  
  summary.forEach(line => console.log(line));
  
  // Also emit to HUD if available
  const emit = (window as any).__debugEvent;
  if (emit) emit('[DEBUG-SUMMARY] Check console for full details');
}

// Call this manually in console to get instant summary
if (typeof window !== 'undefined') {
  (window as any).debugSummary = logDebugSummary;
}