import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RafflePublic } from "@/types/public-views";
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
  const [top, setTop] = React.useState<RafflePublic[]>([]);
  const [recent, setRecent] = React.useState<RafflePublic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        // Use type assertion to work around TypeScript limitations
        const base = () => (supabase as any)
          .from('raffles_public_ext')
          .select('id,title,description,image_url,ticket_price,total_tickets,paid_tickets,progress_pct,category_name,subcategory_name,draw_date,status,category_id,subcategory_id');
        
        const [a, b] = await Promise.all([
          base().order("progress_pct", { ascending: false }).limit(6),
          base().order("draw_date", { ascending: true }).limit(6),
        ]);
        if (!cancelled) {
          if (a.error) throw a.error;
          if (b.error) throw b.error;
          setTop((a.data ?? []) as RafflePublic[]);
          setRecent((b.data ?? []) as RafflePublic[]);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Falha ao carregar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const Grid = ({ items }: { items: RafflePublic[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((r) => <RaffleCard key={r.id} r={r} onClick={(id) => navigate(`/#/ganhavel/${id}`)} />)}
    </div>
  );

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
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