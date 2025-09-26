# Hard Reload Debug Kit

This debug kit helps identify what's causing unexpected page reloads in the Ganhavel app.

## How to Enable

Add this to your `.env` file:
```
VITE_DEBUG_HARDRELOAD=1
```

Then refresh the page.

## What You'll See

A debug overlay will appear in the bottom-right corner showing:
- Navigation events (reload, navigate, back/forward)
- Auth state changes 
- Service worker updates
- Polling/interval ticks
- Realtime subscription events
- Visibility/focus changes
- API calls with auth issues (401/419)
- Any manual `location.reload()` calls with stack traces

## Controls

- **Alt+D**: Toggle overlay visibility
- **Clear**: Clear all logged events
- **×**: Hide overlay (use Alt+D to show again)

## Instrumented Components

### Navigation & Browser Events
- `src/debug/installNavigationDebug.ts` - Tracks all navigation, history changes, visibility, focus
- Monkey-patches `location.reload()` to capture stack traces

### Authentication
- `src/providers/AuthProvider.tsx` - Logs all auth state changes
- Guards against duplicate auth listeners

### Polling & Real-time
- `src/components/EmAltaRecentes.tsx` - Logs auto-refresh intervals
- Supabase realtime subscription events

### Service Worker (if applicable)
- Logs service worker update events
- Tracks SW-triggered reloads

## Debugging Tips

1. **Look for patterns**: Do reloads happen after specific events?
2. **Check timestamps**: Are events happening in rapid succession?
3. **Stack traces**: If you see `location.reload`, check the stack to find the trigger
4. **Auth loops**: Watch for repeated SIGNED_IN/SIGNED_OUT cycles
5. **Polling issues**: Check if intervals are being created multiple times

## When Done Debugging

Remove `VITE_DEBUG_HARDRELOAD=1` from your `.env` to disable all debugging overhead.