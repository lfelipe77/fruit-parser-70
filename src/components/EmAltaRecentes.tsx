import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

// tiny inline helper (no new file)
function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d >= 1) return `${d} ${d===1?'dia':'dias'}`;
  if (h >= 1) return `${h} ${h===1?'hora':'horas'}`;
  if (m >= 1) return `${m} ${m===1?'min':'mins'}`;
  return `${s} s`;
}

type RafflePublic = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  ticket_price: number;
  goal_amount: number;
  amount_collected: number;
  progress_pct: number;
  status: string;
  created_at: string;
  last_paid_at?: string | null;
  paid_tickets?: number;
  participants_count?: number;
  tickets_remaining?: number;
};

const brl = (n: number | null | undefined) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Compact, uncluttered home card */
function RCard({ r }: { r: RafflePublic }) {
  const pct = Math.max(0, Math.min(100, Number(r.progress_pct || 0)));
  const soldOut = (r.tickets_remaining ?? 1) === 0;
  const buyable = r.status === "approved" && pct < 100 && !soldOut;
  const buyLabel = buyable ? "Comprar bilhete" : "Ver detalhes";

  return (
    <Link
      to={`/ganhaveis/${r.id}`}
      className="group rounded-2xl border bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
        <img
          src={r.image_url || "/placeholder.svg"}
          alt={r.title}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform"
        />
      </div>

      <div className="p-3">
        <h3 className="font-semibold leading-snug line-clamp-2 text-[15px] md:text-base">
          {r.title}
        </h3>

        <div className="mt-2 text-xs text-gray-600">
          {brl(r.amount_collected)} de {brl(r.goal_amount)}
        </div>
        {r.last_paid_at && (
          <div className="mt-1 text-[11px] text-gray-500">
            Última compra {timeAgo(r.last_paid_at)} atrás
          </div>
        )}

        <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden" aria-label="progresso">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-700">
          <span>{pct}% concluído</span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">Bilhete {brl(r.ticket_price)}</span>
        </div>

        <div className="mt-3 flex items-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-xl text-sm
                           bg-emerald-600 text-white group-hover:bg-emerald-700">
            {buyLabel}
          </span>
          {soldOut && (
            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
              Esgotado
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

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
        const base = () => supabase.from("raffles_public").select("*");
        const [a, b] = await Promise.all([
          base().order("progress_pct", { ascending: false }).limit(12),
          base().order("created_at", { ascending: false }).limit(12),
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
      {items.map((r) => <RCard key={r.id} r={r} />)}
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