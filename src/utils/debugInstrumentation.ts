// Debug instrumentation helper for analyzing 30s jump behavior

export function logDebugSummary() {
  if (typeof window === 'undefined') return;
  
  console.log('==== 30S JUMP DEBUG SUMMARY ====');
  console.log('Current URL:', window.location.href);
  console.log('Scroll position:', window.scrollY);
  console.log('Document ready state:', document.readyState);
  console.log('Navigation timing:', performance.getEntriesByType('navigation')[0]);
  console.log('Debug flag enabled:', localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true');
  console.log('===============================');
}

// Call this manually in console to get instant summary
if (typeof window !== 'undefined') {
  (window as any).debugSummary = logDebugSummary;
}