import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uidChecked, setUidChecked] = React.useState(false);
  const [uid, setUid] = React.useState<string | null>(null);
  React.useEffect(() => { (async () => {
    const { data } = await supabase.auth.getUser();
    setUid(data.user?.id ?? null);
    setUidChecked(true);
  })(); }, []);
  if (!uidChecked) return null; // or a small skeleton
  if (!uid) return (
    <section className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Meu Perfil</h1>
      <p className="text-gray-700">Você precisa estar autenticado.</p>
      <Link to="/login" className="underline text-emerald-700">Entrar</Link>
    </section>
  );
  return <>{children}</>;
};

type RaffleBase = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  image_url: string | null;
  ticket_price: number | null;
  total_tickets: number | null;
  status: "under_review" | "approved" | "scheduled" | "closed" | "delivered";
};

type RaffleProg = {
  id: string;
  paid_tickets: number;
  tickets_remaining: number;
  amount_collected: number;
  goal_amount: number;
  progress_pct: number;
  last_paid_at: string | null;
};

const brl = (n: number | null | undefined) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function timeAgo(d: string | null) {
  if (!d) return null;
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  const m = Math.floor(diff / 60), h = Math.floor(m / 60), dys = Math.floor(h / 24);
  if (diff < 60) return "agora";
  if (m < 60) return `${m} min`;
  if (h < 24) return `${h} h`;
  return `${dys} d`;
}

function StatusBadge({ s }: { s: RaffleBase["status"] }) {
  const map: Record<RaffleBase["status"], string> = {
    under_review: "Em análise",
    approved: "Aprovada",
    scheduled: "Agendada",
    closed: "Encerrada",
    delivered: "Entregue",
  };
  const tone: Record<RaffleBase["status"], string> = {
    under_review: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    scheduled: "bg-blue-100 text-blue-800",
    closed: "bg-gray-100 text-gray-800",
    delivered: "bg-purple-100 text-purple-800",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs ${tone[s]}`}>{map[s]}</span>;
}

function Card({ r, p }: { r: RaffleBase; p?: RaffleProg }) {
  const pct = Math.max(0, Math.min(100, Number(p?.progress_pct ?? 0)));
  const last = p?.last_paid_at ? timeAgo(p.last_paid_at) : null;

  return (
    <Link
      to={`/ganhavel/${r.id}`}
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
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug line-clamp-2">{r.title}</h3>
          <StatusBadge s={r.status} />
        </div>

        {(r.status === "approved" || r.status === "scheduled" || r.status === "closed" || r.status === "delivered") && (
          <>
            <div className="mt-2 text-sm text-gray-700">
              {brl(p?.amount_collected)} de {brl(p?.goal_amount)}
            </div>
            <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden" aria-label="progresso">
              <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
              <span>{pct}% concluído</span>
              {last && <span>Última compra: {last}</span>}
            </div>
          </>
        )}

        {r.status === "under_review" && (
          <div className="mt-3 text-sm text-gray-600">
            Seu Ganhavel foi enviado e está em análise. Você receberá um e-mail quando for aprovado.
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Profile() {
  const [mine, setMine] = React.useState<RaffleBase[]>([]);
  const [prog, setProg] = React.useState<Record<string, RaffleProg>>({});
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        // 1) get me
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const uid = userRes.user?.id;
        if (!uid) throw new Error("Precisa estar autenticado");

        // 2) fetch all my raffles (including under_review)
        const { data: rows, error } = await supabase
          .from("raffles")
          .select("id, created_at, title, description, image_url, ticket_price, total_tickets, status")
          .eq("owner_user_id", uid)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const base = (rows ?? []) as RaffleBase[];
        if (!cancelled) setMine(base);

        // 3) enrich approved+ with progress from raffles_public_v2
        const approvedIds = base
          .filter((r) => ["approved", "scheduled", "closed", "delivered"].includes(r.status))
          .map((r) => r.id);

        if (approvedIds.length) {
          const { data: rows2, error: err2 } = await supabase
            .from("raffles_public_v2")
            .select("id, paid_tickets, tickets_remaining, amount_collected, goal_amount, progress_pct, last_paid_at")
            .in("id", approvedIds);

          if (err2) throw err2;

          const map: Record<string, RaffleProg> = {};
          (rows2 ?? []).forEach((x) => { map[x.id] = x as RaffleProg; });
          if (!cancelled) setProg(map);
        } else {
          if (!cancelled) setProg({});
        }
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Falha ao carregar seus Ganhavéis");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sections = [
    { key: "under_review", title: "Em análise" as const },
    { key: "approved", title: "Aprovados" as const },
    { key: "scheduled", title: "Agendados" as const },
    { key: "closed", title: "Encerrados" as const },
    { key: "delivered", title: "Entregues" as const },
  ] as const;

  if (err) return <div className="max-w-6xl mx-auto p-6 text-red-700">{err}</div>;

  return (
    <Guard>
      <section className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">Meu Perfil</h1>
          <Link to="/lance-seu-ganhavel" className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            + Lançar Ganhavel
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-white overflow-hidden">
                <div className="aspect-[16/10] bg-gray-100 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          sections.map((sec) => {
            const items = mine.filter((r) => r.status === sec.key);
            if (!items.length) return null;
            return (
              <div key={sec.key}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xl md:text-2xl font-semibold">{sec.title}</h2>
                  <span className="text-sm text-gray-600">{items.length}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((r) => <Card key={r.id} r={r} p={prog[r.id]} />)}
                </div>
              </div>
            );
          })
        )}

        {!loading && !mine.length && (
          <div className="rounded-2xl border bg-white p-6 text-gray-700">
            Você ainda não lançou nenhum Ganhavel. <Link to="/lance-seu-ganhavel" className="underline text-emerald-700">Lançar agora</Link>.
          </div>
        )}
      </section>
    </Guard>
  );
}