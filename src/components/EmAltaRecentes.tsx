import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RaffleCardInfo } from "@/types/raffles";
import RaffleCard from "./RaffleCard";

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
  const [top, setTop] = React.useState<RaffleCardInfo[]>([]);
  const [recent, setRecent] = React.useState<RaffleCardInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    
    const RAFFLE_CARD_SELECT =
      "id,title,description,image_url,status," +
      "ticket_price,goal_amount,amount_raised,progress_pct_money," +
      "last_paid_at,created_at,draw_date," +
      "category_name,subcategory_name," +
      "location_display:location_city,participants_count";
    
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const [emAlta, recentes] = await Promise.all([
          supabase
            .from("raffles_public_money_ext")
            .select(RAFFLE_CARD_SELECT)
            .in('status', ['active','drawing','completed'])
            .order("last_paid_at", { ascending: false, nullsFirst: false }) // nulls last
            .limit(12),
          supabase
            .from("raffles_public_money_ext")
            .select(RAFFLE_CARD_SELECT)
            .in('status', ['active','drawing','completed'])
            .order("created_at", { ascending: false })
            .limit(24)
        ]);
        
        if (!cancelled) {
          if (emAlta.error) throw emAlta.error;
          if (recentes.error) throw recentes.error;
          
          console.debug('[Raffles] sample row', emAlta.data?.[0]);
          
          setTop(((emAlta.data || []) as unknown as RaffleCardInfo[]).slice(0, 3));
          setRecent(((recentes.data || []) as unknown as RaffleCardInfo[]).slice(0, 3));
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Falha ao carregar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    // Listen for raffle updates to invalidate and re-fetch - throttled
    let fetchInFlight = false;
    const safeFetchData = async () => {
      if (fetchInFlight || cancelled) {
        console.log('[EmAltaRecentes] skipping fetch - in flight or cancelled');
        return;
      }
      fetchInFlight = true;
      try {
        await fetchData();
      } finally {
        fetchInFlight = false;
      }
    };

    const handleRaffleUpdate = (event?: any) => {
      console.log('[EmAltaRecentes] Received raffleUpdated event:', event?.detail);
      if (!cancelled) {
        safeFetchData();
      }
    };

    // Listen for raffle completion events
    const handleRaffleCompletion = (event?: any) => {
      console.log('[EmAltaRecentes] Received raffleCompleted event:', event?.detail);
      if (!cancelled) {
        safeFetchData(); // Refresh to show in completed section
      }
    };

    window.addEventListener('raffleUpdated', handleRaffleUpdate);
    window.addEventListener('raffleCompleted', handleRaffleCompletion);
    
    // Auto-refresh with visibility check - don't poll when hidden
    const interval = setInterval(() => {
      if (!cancelled && document.visibilityState === 'visible') {
        console.log('[EmAltaRecentes] Auto-refreshing data...');
        safeFetchData();
      } else if (!cancelled) {
        console.log('[EmAltaRecentes] Skipping refresh - tab hidden');
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => { 
      cancelled = true; 
      window.removeEventListener('raffleUpdated', handleRaffleUpdate);
      window.removeEventListener('raffleCompleted', handleRaffleCompletion);
      clearInterval(interval);
    };
  }, []);

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
    <section className="px-6 py-10 max-w-6xl mx-auto space-y-8">
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