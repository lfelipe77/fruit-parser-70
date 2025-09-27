import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RaffleCardInfo } from "@/types/raffles";
import RaffleCard from "./RaffleCard";
import { DebugBus } from "@/debug/DebugBus";
import { useVisibilityRefresh } from "@/hooks/useVisibilityRefresh";
import { useDiffState } from "@/hooks/useDiffState";
import { env } from "@/config/env";

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="aspect-[16/10] bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
        <div className="h-2 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function EmAltaRecentesSection() {
  const navigate = useNavigate();
  const [top, updateTop] = useDiffState<RaffleCardInfo[]>([]);
  const [recent, updateRecent] = useDiffState<RaffleCardInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  
  // Get refresh interval from env (default 30s)
  const refreshInterval = React.useMemo(() => {
    const envMs = env.CALM_REFRESH_MS;
    return envMs ? parseInt(envMs, 10) : 30000;
  }, []);

  const RAFFLE_CARD_SELECT =
    "id,title,description,image_url,status," +
    "ticket_price,goal_amount,amount_raised,progress_pct_money," +
    "last_paid_at,created_at,draw_date," +
    "category_name,subcategory_name," +
    "location_display:location_city,participants_count";

  const fetchData = React.useCallback(async () => {
    DebugBus.add({
      ts: Date.now(),
      source: 'EmAltaRecentes:fetchData',
      detail: { refreshInterval }
    });
    
    setLoading(true);
    setErr(null);
    
    try {
      const [emAlta, recentes] = await Promise.all([
        supabase
          .from("raffles_public_ext")
          .select(RAFFLE_CARD_SELECT)
          .in('status', ['active', 'drawing', 'premiado'])
          .order('last_paid_at', { ascending: false, nullsFirst: false })
          .order('participants_count', { ascending: false, nullsFirst: true })
          .order('amount_raised', { ascending: false, nullsFirst: true })
          .order('created_at', { ascending: false })
          .limit(12),
        supabase
          .from("raffles_public_ext")
          .select(RAFFLE_CARD_SELECT)
          .in('status', ['active', 'drawing', 'premiado'])
          .order("created_at", { ascending: false })
          .limit(24)
      ]);
      
      if (emAlta.error) throw emAlta.error;
      if (recentes.error) throw recentes.error;
      
      console.debug('[EmAlta] count=%d sample=%o', emAlta.data?.length ?? 0, emAlta.data?.slice(0,3)?.map((r: any) => r.id));
      
      const newTop = ((emAlta.data || []) as unknown as RaffleCardInfo[]).slice(0, 3);
      const newRecent = ((recentes.data || []) as unknown as RaffleCardInfo[]).slice(0, 3);
      
      // Use diff state updates - only re-render if data actually changed
      const topChanged = updateTop(newTop);
      const recentChanged = updateRecent(newRecent);
      
      if (topChanged || recentChanged) {
        console.debug('[EmAltaRecentes] Data changed, re-rendering');
      } else {
        console.debug('[EmAltaRecentes] No changes detected, skipping re-render');
      }
      
    } catch (e: any) {
      setErr(e?.message ?? "Falha ao carregar");
    } finally {
      setLoading(false);
    }
  }, [updateTop, updateRecent]);

  // Initial fetch
  React.useEffect(() => {
    DebugBus.add({
      ts: Date.now(),
      source: 'EmAltaRecentes:mount',
      detail: { url: window.location.href, refreshInterval }
    });
    
    fetchData();
  }, [fetchData]);

  // Listen for raffle events
  React.useEffect(() => {
    const handleRaffleUpdate = (event?: any) => {
      console.log('[EmAltaRecentes] Received raffleUpdated event:', event?.detail);
      DebugBus.add({
        ts: Date.now(),
        source: 'EmAltaRecentes:raffleUpdated',
        detail: { event: event?.detail }
      });
      fetchData();
    };

    const handleRaffleCompletion = (event?: any) => {
      console.log('[EmAltaRecentes] Received raffleCompleted event:', event?.detail);
      DebugBus.add({
        ts: Date.now(),
        source: 'EmAltaRecentes:raffleCompleted',
        detail: { event: event?.detail }
      });
      fetchData();
    };

    window.addEventListener('raffleUpdated', handleRaffleUpdate);
    window.addEventListener('raffleCompleted', handleRaffleCompletion);
    
    return () => {
      window.removeEventListener('raffleUpdated', handleRaffleUpdate);
      window.removeEventListener('raffleCompleted', handleRaffleCompletion);
    };
  }, [fetchData]);

  // Visibility-aware refresh
  useVisibilityRefresh({
    refreshInterval,
    onRefresh: fetchData,
    enabled: true
  });

  const Grid = ({ items }: { items: RaffleCardInfo[] }) => (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((r) => <RaffleCard key={r.id} r={r} />)}
    </div>
  );

  const SkeletonGrid = () => (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );

  const Empty = () => (
    <div className="text-sm text-gray-600 border rounded-2xl p-6 mt-3">
      Ainda não há Ganhavéis aqui. Volte em breve!
    </div>
  );

  if (err) {
    return (
      <section className="px-6 py-10 max-w-6xl mx-auto">
        <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{err}</div>
      </section>
    );
  }

  return (
    <section className="px-6 pt-4 pb-10 max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">🔥 Ganhavéis em alta</h2>
          <Link to="/descobrir" className="text-sm underline text-emerald-700">Ver todos</Link>
        </div>
        <div className="mt-4">
          {loading ? <SkeletonGrid /> : (top.length ? <Grid items={top} /> : <Empty />)}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">🆕 Recentes</h2>
          <Link to="/descobrir" className="text-sm underline text-emerald-700">Ver todos</Link>
        </div>
        <div className="mt-4">
          {loading ? <SkeletonGrid /> : (recent.length ? <Grid items={recent} /> : <Empty />)}
        </div>
      </div>
    </section>
  );
}