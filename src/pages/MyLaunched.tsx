import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getLaunchedWithProgress, RaffleWithProgress } from '@/data/raffles';
import RaffleCard from '@/components/RaffleCard';

export default function MyLaunched() {
  const nav = useNavigate();
  const [rows, setRows] = useState<RaffleWithProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) { 
        setRows([]); 
        setLoading(false); 
        return; 
      }

      // Only fetch active and completed raffles
      const list = await getLaunchedWithProgress(uid, ['active', 'completed']);
      if (!cancelled) setRows(list);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-3 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Ganháveis que Lancei</h1>
        <div className="flex gap-2">
          <Link to="/" className="px-3 py-1.5 rounded-md border">Início</Link>
          <Link to="/lance-seu-ganhavel" className="px-3 py-1.5 rounded-md border">Criar Novo</Link>
          <Link to="/dashboard" className="px-3 py-1.5 rounded-md border">Dashboard</Link>
        </div>
      </div>

      {loading && <div className="mx-auto max-w-6xl px-3">Carregando…</div>}

      <div className="mx-auto max-w-6xl px-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(r => (
          <RaffleCard
            key={r.id}
            raffle={r}
            showBuy={false}
            onView={() => nav(`/ganhavel/${r.id}`)}
          />
        ))}
      </div>

      {!loading && rows.length === 0 && (
        <div className="mx-auto max-w-6xl px-3 opacity-70 text-sm mt-6">
          Nenhum ganhável ativo/completo.
        </div>
      )}
    </div>
  );
}