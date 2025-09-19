// debugGate.ts
export function resolveDebugFlags() {
  const sp = new URLSearchParams(window.location.search);

  // Use ?no30s=1 to disable 30s polling jump
  const no30s = sp.get('no30s') === '1';
  
  // Use ?nohard=1|0 to control hard reloads (default: soft/no hard reloads)
  const nohard = sp.get('nohard');
  
  // Use ?hud=1 to show debug HUD
  const hud = sp.get('hud') === '1';

  // Persist in localStorage so it survives SPA navigations
  if (no30s) localStorage.setItem('DEBUG_DISABLE_30S_JUMP', 'true');
  if (sp.get('no30s') === '0') localStorage.removeItem('DEBUG_DISABLE_30S_JUMP');
  
  // nohard flag: default is true (no hard reloads), can be overridden
  if (nohard === '1') localStorage.setItem('DEBUG_NO_HARD_RELOADS', 'true');
  if (nohard === '0') localStorage.setItem('DEBUG_NO_HARD_RELOADS', 'false');
  
  // hud flag
  if (hud) localStorage.setItem('SHOW_DEBUG_HUD', 'true');
  if (sp.get('hud') === '0') localStorage.removeItem('SHOW_DEBUG_HUD');

  // Clean URL params after persisting
  if (nohard || sp.get('no30s') || sp.get('hud')) {
    const cleanUrl = window.location.pathname + window.location.hash;
    try {
      window.history.replaceState(window.history.state, '', cleanUrl);
    } catch (e) {
      console.warn('[debugGate] Failed to clean URL params:', e);
    }
  }

  return {
    DEBUG_DISABLE_30S_JUMP: localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true',
    // Default to true (no hard reloads) unless explicitly disabled
    DEBUG_NO_HARD_RELOADS: localStorage.getItem('DEBUG_NO_HARD_RELOADS') !== 'false',
    SHOW_DEBUG_HUD: localStorage.getItem('SHOW_DEBUG_HUD') === 'true',
  };
}