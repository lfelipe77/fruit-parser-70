import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RafflePublicMoney } from "@/types/public-views";
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
  const [top, setTop] = React.useState<RafflePublicMoney[]>([]);
  const [recent, setRecent] = React.useState<RafflePublicMoney[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = () => (supabase as any)
          .from('raffles_public_money_ext')
          .select('id,title,description,image_url,ticket_price,amount_raised,goal_amount,progress_pct_money,category_name,subcategory_name,status,last_paid_at,draw_date');
        
        const [a, b] = await Promise.all([
          base().order("last_paid_at", { ascending: false }).limit(3),
          base().order("created_at", { ascending: false }).limit(3),
        ]);
        if (!cancelled) {
          if (a.error) throw a.error;
          if (b.error) throw b.error;
          setTop((a.data ?? []) as RafflePublicMoney[]);
          let recentData = (b.data ?? []) as RafflePublicMoney[];
          // Fallbacks for "Recentes": draw_date desc, then id desc
          if (recentData.length === 0) {
            const fb1 = await base().order('draw_date', { ascending: false }).limit(3);
            if (fb1.error) throw fb1.error;
            recentData = (fb1.data ?? []) as RafflePublicMoney[];
            if (recentData.length === 0) {
              const fb2 = await base().order('id', { ascending: false }).limit(3);
              if (fb2.error) throw fb2.error;
              recentData = (fb2.data ?? []) as RafflePublicMoney[];
            }
          }
          setRecent(recentData);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Falha ao carregar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const Grid = ({ items }: { items: RafflePublicMoney[] }) => (
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
        {loading ? <SkeletonGrid /> : (top.length ? <Grid items={top} /> : <Empty />)}
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">🆕 Recentes</h2>
          <Link to="/descobrir" className="text-sm underline text-emerald-700">Ver todos</Link>
        </div>
        {loading ? <SkeletonGrid /> : (recent.length ? <Grid items={recent} /> : <Empty />)}
      </div>
    </section>
  );
}