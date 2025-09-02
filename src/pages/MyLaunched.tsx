import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLaunchedWithProgress, RaffleWithProgress } from '@/data/raffles';

const TABS = [
  { key: 'active',     label: 'Ativos',      statuses: ['active'] },
  { key: 'completed',  label: 'Completos',   statuses: ['completed'] },
  { key: 'draft',      label: 'Rascunhos',   statuses: ['draft'] },
  { key: 'archived',   label: 'Arquivados',  statuses: ['archived'] },
  { key: 'all',        label: 'Todos',       statuses: null as string[] | null },
];

function ProgressBar({ value }: { value?: number | null }) {
  const pct = Math.max(0, Math.min(Number(value ?? 0), 100));
  return (
    <div className="w-full h-2 rounded-full bg-gray-200/60">
      <div
        role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
        data-testid="raffle-progress"
        className="h-2 rounded-full bg-emerald-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MyLaunched() {
  const params = new URLSearchParams(location.hash.split('?')[1] || location.search);
  const initialTab = (params.get('tab') as any) || 'active';
  const [tab, setTab] = useState<'active'|'completed'|'draft'|'archived'|'all'>(initialTab);
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

      const statuses = TABS.find(t => t.key === tab)?.statuses ?? null;
      const list = await getLaunchedWithProgress(uid, statuses);
      if (!cancelled) setRows(list);
      setLoading(false);

      const debug = new URLSearchParams(location.hash.split('?')[1]).get('debug') === '1';
      if (debug) {
        console.log('[MyLaunched]', { uid, tab, count: list.length });
        console.table(list.slice(0, 15).map(x => ({
          id: x.id.slice(0,8), status: x.status, pct: x.progress_pct_money
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [tab]);

  const buttons = useMemo(() => TABS.map(t => (
    <button
      key={t.key}
      data-testid={`tab-${t.key}`}
      className={`px-3 py-1 rounded-full border ${tab === t.key ? 'bg-emerald-50 border-emerald-400' : 'border-gray-300'}`}
      onClick={() => setTab(t.key as any)}
    >
      {t.label}
    </button>
  )), [tab]);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4">
      <div className="mb-3 flex gap-2 flex-wrap">{buttons}</div>

      {loading && <div className="text-sm opacity-70">Carregando…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map(r => {
          const canBuy = r.status === 'active';
          return (
            <div key={r.id} data-testid="raffle-card" className="rounded-lg border p-3">
              <img src={r.image_url ?? ''} alt={r.title ?? 'Ganhável'} className="w-full h-40 object-cover rounded-md mb-2" />
              <div className="text-sm font-medium line-clamp-1">{r.title}</div>
              <div className="text-xs opacity-60 mb-2">Status: {r.status ?? '—'}</div>
              <ProgressBar value={r.progress_pct_money} />
              <div className="text-xs tabular-nums mt-1" data-testid={`progress-pct-${r.id}`}>
                {(r.progress_pct_money ?? 0)}%
              </div>
              <div className="mt-2 flex gap-2">
                <a className="px-2 py-1 rounded-md border" href={`/#/raffle/${r.id}`}>Ver Ganhável</a>
                <button
                  data-testid="buy-button"
                  className="px-2 py-1 rounded-md border"
                  disabled={!canBuy}
                  title={!canBuy ? `Indisponível (status: ${r.status})` : undefined}
                >
                  Comprar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && rows.length === 0 && (
        <div className="opacity-70 text-sm mt-6">Nenhum ganhável para "{TABS.find(t=>t.key===tab)?.label}".</div>
      )}
    </div>
  );
}