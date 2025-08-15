import * as React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/** ---- Types (match raffles_public view) ---- */
type RafflePublic = {
  id: string;
  created_at: string;
  owner_user_id: string | null;
  title: string;
  description: string | null;
  category_id: number | null;
  image_url: string | null;
  prize_value: number | null;
  ticket_price: number;
  total_tickets: number;
  draw_date: string | null;
  status: string;
  winner_user_id: string | null;
  category: string | null;
  paid_tickets: number;
  tickets_remaining: number;
  goal_amount: number;
  amount_collected: number;
  progress_pct: number;
  slug?: string | null;
  draw_timestamp?: string | null;
  updated_at?: string | null;
  user_id?: string | null;
  organizer_id?: string | null;
  product_name?: string | null;
  product_value?: number | null;
  vendor_link?: string | null;
  participants_count?: number;
  last_paid_at?: string | null;
};

/** ---- Small helpers ---- */
const brl = (n: number | null | undefined) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function since(d?: string | null) {
  if (!d) return null;
  const secs = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (secs < 60) return `há ${Math.floor(secs)}s`;
  const mins = secs / 60;
  if (mins < 60) return `há ${Math.floor(mins)}min`;
  const hrs = mins / 60;
  if (hrs < 24) return `há ${Math.floor(hrs)}h`;
  const days = hrs / 24;
  return `há ${Math.floor(days)}d`;
}

/** ---- Inline Money Bar (no extra file) ---- */
function MoneyBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, Number(pct || 0)));
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden" aria-label="progresso">
      <div className="h-full bg-emerald-500" style={{ width: `${clamped}%` }} />
    </div>
  );
}

/** ---- Page ---- */
export default function GanhaveisDetail() {
  const { id } = useParams<{ id: string }>();

  const [raffle, setRaffle] = React.useState<RafflePublic | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // Load raffle data
  React.useEffect(() => {
    let cancelled = false;
    if (!id) return;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data, error } = await supabase
          .from("raffles_public")
          .select("*")
          .eq("id", id)
          .maybeSingle();
          
        if (error) throw error;
        if (!cancelled) {
          setRaffle(data as RafflePublic | null);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Falha ao carregar.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Realtime: refresh progress bits on ticket changes
  React.useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`raffle-tix-${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `raffle_id=eq.${id}` },
        async () => {
          const { data, error } = await supabase
            .from("raffles_public")
            .select("paid_tickets,tickets_remaining,amount_collected,goal_amount,progress_pct")
            .eq("id", id)
            .maybeSingle();
          if (!error && data && setRaffle) {
            setRaffle((prev) => (prev ? { ...prev, ...data } : prev));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [id]);

  // Derived UI state
  const soldOut = raffle ? Number(raffle.tickets_remaining || 0) <= 0 : false;
  const metaDone = raffle ? Number(raffle.progress_pct || 0) >= 100 : false;
  const buyable =
    !!raffle && raffle.status === "approved" && !soldOut && !metaDone && Number(raffle.ticket_price) > 0;

  // Share helpers
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copiado! 📋");
    } catch {
      alert("Não foi possível copiar o link.");
    }
  }
  async function nativeShare() {
    if ((navigator as any).share) {
      try {
        await (navigator as any).share({
          title: raffle?.title ?? "Ganhavel",
          text: "Confira este Ganhavel!",
          url: window.location.href,
        });
      } catch {}
    } else {
      copyLink();
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="h-6 w-48 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="aspect-[16/10] bg-gray-100 rounded-2xl animate-pulse" />
            <div className="mt-4 h-3 bg-gray-100 rounded animate-pulse" />
            <div className="mt-2 h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
          </div>
          <div className="border rounded-2xl p-4">
            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="mt-3 h-10 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Ganhavel não encontrado</h1>
        <p className="text-gray-600">Verifique o link ou explore outros Ganhavéis.</p>
        <div className="mt-4">
          <Link to="/" className="underline text-emerald-700">
            Voltar para a Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{raffle.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {/* State badges */}
            {raffle.status !== "approved" && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Em revisão</span>
            )}
            {soldOut && <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">Esgotado</span>}
            {metaDone && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Meta alcançada — aguardando sorteio
              </span>
            )}
            {!!raffle.participants_count && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {raffle.participants_count} participantes
              </span>
            )}
            {raffle.last_paid_at && (
              <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-700">
                Última compra {since(raffle.last_paid_at)}
              </span>
            )}
          </div>
        </div>

        {/* Share */}
        <div className="shrink-0 flex gap-2">
          <button
            onClick={nativeShare}
            className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            title="Compartilhar"
          >
            Compartilhar
          </button>
          <button
            onClick={copyLink}
            className="inline-flex items-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            title="Copiar link"
          >
            Copiar link
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 grid gap-4">
          <div className="rounded-2xl border overflow-hidden bg-white">
            <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
              <img
                src={raffle.image_url || "/placeholder.svg"}
                alt={raffle.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-600">
                {brl(raffle.amount_collected)} de {brl(raffle.goal_amount)}
              </div>
              <div className="mt-2">
                <MoneyBar pct={raffle.progress_pct} />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                <span>{raffle.progress_pct}% concluído</span>
                <span>Bilhete {brl(raffle.ticket_price)}</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                🎯 Sorteio após arrecadação total • 🏛️ Loteria Federal
              </p>

              {raffle.vendor_link && (
                <div className="mt-3">
                  <a
                    href={raffle.vendor_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-sm bg-gray-900 text-white hover:bg-black"
                  >
                    Comprar diretamente com o vendedor
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <section className="rounded-2xl border p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Detalhes do prêmio</h2>
            {raffle.description ? (
              <div className="whitespace-pre-line text-gray-800 text-sm leading-relaxed">
                {raffle.description}
              </div>
            ) : (
              <div className="text-sm text-gray-600">Sem descrição.</div>
            )}
          </section>
        </div>

        {/* Right column — Buy box (UI state only; hook into your flow as needed) */}
        <aside className="grid gap-4">
          <section className="rounded-2xl border p-4 bg-white">
            <h3 className="text-base font-semibold mb-2">Comprar bilhetes</h3>
            <div className="text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Preço do bilhete</span>
                <b>{brl(raffle.ticket_price)}</b>
              </div>
              <div className="mt-2 flex justify-between">
                <span>Arrecadado</span>
                <b>{brl(raffle.amount_collected)}</b>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Meta</span>
                <b>{brl(raffle.goal_amount)}</b>
              </div>
            </div>

            <button
              disabled={!buyable}
              className="mt-3 w-full rounded-xl bg-emerald-600 text-white py-2 text-sm disabled:opacity-60"
              onClick={() => alert("Fluxo de compra aqui (reserve_tickets + checkout).")}
              title={
                buyable
                  ? "Comprar bilhetes"
                  : soldOut
                    ? "Esgotado"
                    : metaDone
                      ? "Meta alcançada — aguardando sorteio"
                      : "Indisponível"
              }
            >
              {soldOut ? "Esgotado" : metaDone ? "Meta alcançada" : "Comprar bilhetes"}
            </button>

            <p className="mt-2 text-[12px] text-gray-500">
              Pagamentos 100% seguros. A compra libera os bilhetes e atualiza o progresso em tempo real.
            </p>
          </section>

          <section className="rounded-2xl border p-4 bg-white">
            <h3 className="text-base font-semibold mb-2">Transparência</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Progresso atualizado em tempo real</li>
              <li>• Sorteio quando atingir 100%</li>
              <li>• Baseado na Loteria Federal</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}