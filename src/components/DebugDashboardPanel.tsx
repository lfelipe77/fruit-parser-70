import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type DebugState = {
  loading: boolean;
  uid?: string;
  email?: string;
  profile?: any;
  error?: any;
};

export default function DebugDashboardPanel() {
  const [s, setS] = useState<DebugState>({ loading: true });

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        const email = session?.user?.email ?? session?.user?.user_metadata?.email;

        if (!uid) {
          setS({ loading: false, error: 'Sem sessão ativa (uid vazio)' });
          return;
        }

        const resp = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle(); // won't throw if 0 rows

        setS({
          loading: false,
          uid,
          email,
          profile: resp.data ?? null,
          error: resp.error ?? null
        });
      } catch (e) {
        setS({ loading: false, error: e });
      }
    })();
  }, []);

  if (s.loading) return <div className="text-xs text-gray-500">Carregando…</div>;

  // Always show this panel until we finish debugging
  return (
    <div className="text-xs p-3 rounded-xl shadow-md bg-white border border-gray-200 max-w-full overflow-auto">
      <div style={{fontWeight:600, marginBottom:6}}>Debug do Dashboard</div>
      <div><b>UID:</b> {s.uid || '—'}</div>
      <div><b>Email:</b> {s.email || '—'}</div>
      <div style={{marginTop:6}}><b>Perfil:</b></div>
      <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(s.profile, null, 2)}</pre>
      {s.error && (
        <>
          <div style={{marginTop:6, color:'#b91c1c'}}><b>Erro:</b></div>
          <pre style={{whiteSpace:'pre-wrap', color:'#b91c1c'}}>{JSON.stringify(s.error, null, 2)}</pre>
        </>
      )}
      <div style={{marginTop:6, opacity:.7}}>Quando tudo estiver ok, removemos este painel.</div>
    </div>
  );
}