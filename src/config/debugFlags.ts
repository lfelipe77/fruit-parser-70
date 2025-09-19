// Global debug flag for 30s jump investigation
export const DEBUG_DISABLE_30S_JUMP = false;

// Add this to localStorage to enable: localStorage.setItem('DEBUG_DISABLE_30S_JUMP', 'true')
export const isDebugFlagEnabled = () => {
  if (typeof window === 'undefined') return DEBUG_DISABLE_30S_JUMP;
  return localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true' || DEBUG_DISABLE_30S_JUMP;
};