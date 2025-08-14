import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function GlobalAuthDebugOverlay() {
  const loc = useLocation();
  const [state, setState] = useState<any>({
    route: '', lastEvent: 'none',
    hasSession: false, uid: '', email: '',
    profile: null, profileError: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? '';
      const email = session?.user?.email ?? session?.user?.user_metadata?.email ?? '';

      let profile = null, profileError = null;
      if (uid) {
        const r = await supabase.from('user_profiles').select('*').eq('id', uid).maybeSingle();
        profile = r.data ?? null;
        profileError = r.error ?? null;
      }

      if (!cancelled) {
        setState(s => ({
          ...s,
          route: loc.pathname + loc.hash,
          hasSession: !!session, uid, email,
          profile, profileError,
        }));
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      setState(s => ({ ...s, lastEvent: event }));
    });

    return () => { cancelled = true; sub.subscription?.unsubscribe(); };
  }, [loc.pathname, loc.hash]);

  // Always visible during debugging
  return (
    <div style={{
      position:'fixed', top:12, right:12, zIndex:99999, background:'#fff',
      border:'1px solid #e5e7eb', borderRadius:12, padding:12, maxWidth:420,
      maxHeight:'70vh', overflow:'auto', boxShadow:'0 6px 20px rgba(0,0,0,.15)',
      fontSize:12, lineHeight:1.35
    }}>
      <div style={{fontWeight:700, marginBottom:6}}>Global Debug</div>
      <div><b>Route:</b> {state.route || '(none)'}</div>
      <div><b>Auth event:</b> {state.lastEvent}</div>
      <div><b>Session:</b> {String(state.hasSession)}</div>
      <div><b>UID:</b> {state.uid || '—'}</div>
      <div><b>Email:</b> {state.email || '—'}</div>
      <div><b>Storage keys:</b> {Object.keys(window.localStorage || {}).filter(k => k.includes('sb-') || k.includes('supabase')).join(', ') || '—'}</div>
      <div style={{marginTop:6}}><b>Profile:</b></div>
      <pre style={{whiteSpace:'pre-wrap', margin:0}}>{JSON.stringify(state.profile, null, 2)}</pre>
      {state.profileError && (
        <>
          <div style={{marginTop:6, color:'#b91c1c'}}><b>Profile error:</b></div>
          <pre style={{whiteSpace:'pre-wrap', color:'#b91c1c', margin:0}}>
            {JSON.stringify(state.profileError, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}