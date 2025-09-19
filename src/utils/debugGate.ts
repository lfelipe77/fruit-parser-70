// debugGate.ts
export function resolveDebugFlags() {
  const sp = new URLSearchParams(window.location.search);

  // Use ?no30s=1 to disable 30s polling jump
  const no30s = sp.get('no30s') === '1';
  
  // Use ?nohard=1 to disable hard reloads
  const nohard = sp.get('nohard') === '1';

  // Persist in localStorage so it survives SPA navigations
  if (no30s) localStorage.setItem('DEBUG_DISABLE_30S_JUMP', 'true');
  if (sp.get('no30s') === '0') localStorage.removeItem('DEBUG_DISABLE_30S_JUMP');
  
  if (nohard) localStorage.setItem('DEBUG_NO_HARD_RELOADS', 'true');
  if (sp.get('nohard') === '0') localStorage.removeItem('DEBUG_NO_HARD_RELOADS');

  return {
    DEBUG_DISABLE_30S_JUMP: localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true',
    DEBUG_NO_HARD_RELOADS: localStorage.getItem('DEBUG_NO_HARD_RELOADS') === 'true',
    SHOW_DEBUG_HUD: sp.get('hud') === '1',
  };
}