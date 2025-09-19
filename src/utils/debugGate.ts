// debugGate.ts
export function resolveDebugFlags() {
  const sp = new URLSearchParams(window.location.search);

  // Use ?no30s=1 to disable 30s polling jump
  const no30s = sp.get('no30s') === '1';

  // Persist in localStorage so it survives SPA navigations
  if (no30s) localStorage.setItem('DEBUG_DISABLE_30S_JUMP', 'true');
  if (sp.get('no30s') === '0') localStorage.removeItem('DEBUG_DISABLE_30S_JUMP');

  return {
    DEBUG_DISABLE_30S_JUMP: localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true',
    SHOW_DEBUG_HUD: sp.get('hud') === '1',
  };
}