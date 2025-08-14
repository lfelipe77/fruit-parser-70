import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Raffle = {
  id: string;
  slug?: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  ticket_price: number;
  total_tickets: number;
  paid_tickets: number;
  tickets_remaining: number;
  draw_date: string | null;
  status: string;
};

type Provider = "asaas" | "stripe";

export default function RaffleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState<number>(1);
  const [provider, setProvider] = useState<Provider>("asaas");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // fetch raffle (by id; if your view also has slug and you want fallback, add .eq("slug", id))
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("raffles_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!mounted) return;
      if (error) {
        console.error(error);
        setErrorMsg("Falha ao carregar a rifa.");
      }
      setRaffle(data as Raffle | null);
      setLoading(false);
    }
    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  // realtime: refresh counters on tickets change
  useEffect(() => {
    if (!raffle?.id) return;
    const ch = supabase
      .channel(`raffle-tickets-${raffle.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tickets", filter: `raffle_id=eq.${raffle.id}` },
        async () => {
          const { data } = await supabase
            .from("raffles_public")
            .select("paid_tickets, tickets_remaining")
            .eq("id", raffle.id)
            .maybeSingle();
          if (data && raffle) {
            setRaffle({ ...raffle, paid_tickets: data.paid_tickets, tickets_remaining: data.tickets_remaining });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [raffle?.id]);

  const userId = useMemo(() => session?.user?.id ?? null, [session]);
  const totalAmount = useMemo(() => (raffle ? (qty || 0) * (raffle.ticket_price ?? 0) : 0), [qty, raffle]);

  async function handleBuy() {
    try {
      setErrorMsg(null);
      if (!raffle?.id) return;
      if (!userId) {
        setErrorMsg("Faça login para comprar bilhetes.");
        return;
      }
      if (!qty || qty < 1) {
        setErrorMsg("Informe uma quantidade válida.");
        return;
      }
      if ((raffle.tickets_remaining ?? 0) < 1) {
        setErrorMsg("Rifa esgotada.");
        return;
      }

      setSubmitting(true);

      // 1) reserve tickets
      const { data: reserved, error: reserveErr } = await supabase.rpc("reserve_tickets", {
        p_raffle_id: raffle.id,
        p_qty: qty,
      });
      if (reserveErr) throw reserveErr;
      if (!reserved || !Array.isArray(reserved) || reserved.length === 0) {
        throw new Error("Não há bilhetes disponíveis.");
      }

      // 2) create checkout session via Edge Function
      const fnBase = import.meta.env.VITE_SUPABASE_URL!.replace(".supabase.co", ".functions.supabase.co");
      const res = await fetch(`${fnBase}/create-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          provider,
          raffle_id: raffle.id,
          qty,
          amount: totalAmount,
          currency: "BRL",
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Falha ao iniciar pagamento: ${t}`);
      }
      const { provider: retProv, provider_payment_id, redirect_url } = await res.json();
      if (!provider_payment_id || !redirect_url) {
        throw new Error("Resposta inválida do provedor de pagamento.");
      }

      // 3) insert pending transaction (RLS: user inserts own)
      const { error: txErr } = await supabase.from("transactions").insert({
        user_id: userId,
        ganhavel_id: raffle.id, // Use ganhavel_id instead of raffle_id
        amount: totalAmount,
        payment_provider: retProv,
        payment_id: provider_payment_id,
        status: "pending",
      });
      if (txErr) throw txErr;

      // 4) redirect to provider checkout
      window.location.href = redirect_url;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message ?? "Erro ao processar a compra.");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto p-6">Carregando…</div>;
  if (!raffle) return <div className="max-w-4xl mx-auto p-6">Rifa não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 grid gap-6">
      <button className="text-sm underline" onClick={() => navigate(-1)}>← Voltar</button>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {raffle.image_url ? (
            <img src={raffle.image_url} alt={raffle.title} className="w-full rounded-lg object-cover" />
          ) : (
            <div className="w-full aspect-video bg-gray-100 rounded-lg" />
          )}
        </div>

        <div className="grid gap-3">
          <h1 className="text-2xl font-semibold">{raffle.title}</h1>
          {raffle.description && <p className="text-gray-700 whitespace-pre-line">{raffle.description}</p>}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-3 rounded-lg border">
              <div className="text-gray-500">Preço</div>
              <div className="text-lg font-medium">R$ {raffle.ticket_price?.toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-gray-500">Disponíveis</div>
              <div className="text-lg font-medium">{raffle.tickets_remaining}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-gray-500">Vendidos</div>
              <div className="text-lg font-medium">{raffle.paid_tickets}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-gray-500">Sorteio</div>
              <div className="text-lg font-medium">
                {raffle.draw_date ? new Date(raffle.draw_date).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          {errorMsg && <div className="p-3 rounded bg-red-100 text-red-700">{errorMsg}</div>}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Quantidade</label>
            <input
              type="number"
              min={1}
              className="border rounded p-2 w-32"
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Pagamento</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name="provider" value="asaas" checked={provider === "asaas"} onChange={() => setProvider("asaas")} />
                Asaas
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="provider" value="stripe" checked={provider === "stripe"} onChange={() => setProvider("stripe")} />
                Stripe
              </label>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">R$ {totalAmount.toFixed(2)}</span>
          </div>

          <button
            disabled={submitting || !session}
            onClick={handleBuy}
            className="mt-2 inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 disabled:opacity-60"
          >
            {submitting ? "Processando…" : session ? "Comprar" : "Entre para comprar"}
          </button>
        </div>
      </div>
    </div>
  );
}