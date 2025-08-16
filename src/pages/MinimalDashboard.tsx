import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function MinimalDashboard() {
  const [out, setOut] = useState<any>({loading:true});

  useEffect(() => {
    (async () => {
      const { data:{ session } } = await supabase.auth.getSession();
      const uid = session?.user?.id ?? '';
      let prof = null, err = null;
      if (uid) {
        const r = await supabase.from('user_profiles').select('*').eq('id', uid).maybeSingle();
        prof = r.data ?? null; err = r.error ?? null;
      }
      setOut({ loading:false, uid, email: session?.user?.email ?? session?.user?.user_metadata?.email, prof, err });
    })();
  }, []);

  if (out.loading) return <div style={{padding:16}}>Minimal dashboard…</div>;

  return (
    <div style={{padding:16}}>
      
      <div><b>UID:</b> {out.uid || '—'}</div>
      <div><b>Email:</b> {out.email || '—'}</div>
      <div style={{marginTop:8}}><b>Perfil:</b></div>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(out.prof, null, 2)}</pre>
      {out.err && (<pre style={{whiteSpace:'pre-wrap', color:'#b91c1c'}}>{JSON.stringify(out.err, null, 2)}</pre>)}
    </div>
  );
}