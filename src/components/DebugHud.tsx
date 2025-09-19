// DebugHud.tsx
import React, { useEffect, useRef, useState } from 'react';

export function DebugHud({ show }: { show: boolean }) {
  const [heartbeat, setHeartbeat] = useState(0);
  const [url, setUrl] = useState(window.location.href);
  const lastEventRef = useRef<string>('—');

  useEffect(() => {
    if (!show) return;
    const t = setInterval(() => {
      setHeartbeat(h => h + 1);
      if (window.location.href !== url) setUrl(window.location.href);
    }, 5000);
    return () => clearInterval(t);
  }, [show, url]);

  // Global hooks (place where you dispatch your logs)
  (window as any).__debugEvent = (msg: string) => {
    lastEventRef.current = msg;
    const el = document.getElementById('debug-hud-last');
    if (el) el.textContent = msg;
  };

  if (!show) return null;
  return (
    <div style={{
      position: 'fixed', right: 8, bottom: 8, zIndex: 99999,
      background: 'rgba(0,0,0,.75)', color: '#fff', padding: '8px 10px',
      borderRadius: 8, fontSize: 12, lineHeight: 1.4, maxWidth: 320
    }}>
      <div><b>DEBUG HUD</b></div>
      <div>Heartbeat: {heartbeat}</div>
      <div style={{ overflowWrap: 'anywhere' }}>URL: {url}</div>
      <div id="debug-hud-last">Last: {lastEventRef.current}</div>
      <div>Flag no30s: {localStorage.getItem('DEBUG_DISABLE_30S_JUMP') === 'true' ? 'ON' : 'OFF'}</div>
      <div>Flag nohard: {localStorage.getItem('DEBUG_NO_HARD_RELOADS') === 'true' ? 'ON' : 'OFF'}</div>
      <div>ScrollY: {Math.round(window.scrollY)}</div>
    </div>
  );
}