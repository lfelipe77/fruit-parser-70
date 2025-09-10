import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PayoutSummary } from "@/components/PayoutSummary";

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
  amount_collected?: number;
  goal_amount?: number;
  progress_pct?: number;
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

  // fetch raffle with enhanced financial data from existing views
  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!id) return;
      setLoading(true);
      
      // Get raffle details from money view (enhanced with financial data)
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles_public_money_ext')
        .select('*')
        .eq("id", id)
        .maybeSingle();
      
      if (!mounted) return;
      if (raffleError) {
        console.error('Raffle data error:', raffleError);
        setErrorMsg("Falha ao carregar a rifa.");
        setLoading(false);
        return;
      }
      
      if (raffleData) {
        setRaffle({
          id: raffleData.id,
          title: raffleData.title,
          description: raffleData.description,
          image_url: raffleData.image_url,
          draw_date: raffleData.draw_date,
          status: raffleData.status,
          ticket_price: raffleData.ticket_price,
          total_tickets: raffleData.participants_count || 0,
          paid_tickets: raffleData.participants_count || 0,
          tickets_remaining: Math.max(0, 1000 - (raffleData.participants_count || 0)), // Fallback calculation
          amount_collected: raffleData.amount_raised,
          goal_amount: raffleData.goal_amount,
          progress_pct: raffleData.progress_pct_money
        } as Raffle);
      }
      
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
          const { data } = await (supabase as any)
            .from('raffles_public_ext')
            .select('paid_tickets,tickets_remaining')
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
  const feeAmount = useMemo(() => provider === "asaas" ? 2.00 : 0.00, [provider]);
  const grandTotal = useMemo(() => totalAmount + feeAmount, [totalAmount, feeAmount]);

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
      // Allow purchasing even after goal reached, stop only when winner selected
      if (raffle.status === 'completed' || raffle.status === 'premiado') {
        setErrorMsg("Esta rifa já teve seu ganhador selecionado.");
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
          reservation_id: crypto.randomUUID(),
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Falha ao iniciar pagamento: ${t}`);
      }
      const { provider: retProv, provider_payment_id, redirect_url, fee_fixed, fee_pct, fee_amount, amount: baseAmount, total_amount } = await res.json();
      if (!provider_payment_id || !redirect_url) {
        throw new Error("Resposta inválida do provedor de pagamento.");
      }

      // 3) insert pending transaction (store fees & base amount)
      const { error: txErr } = await supabase.from("transactions").insert({
        user_id: userId,
        raffle_id: raffle.id, // Changed from ganhavel_id to raffle_id
        amount: baseAmount,     // base ticket revenue (qty * ticket_price)
        payment_provider: retProv,
        payment_id: provider_payment_id,
        status: "pending",
        fee_fixed: fee_fixed ?? 0,
        fee_pct: fee_pct ?? 0,
        fee_amount: fee_amount ?? 0
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
              <div className="text-gray-500">Meta</div>
              <div className="text-lg font-medium">R$ {raffle.goal_amount?.toFixed(2) || "—"}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-gray-500">Arrecadado</div>
              <div className="text-lg font-medium">R$ {raffle.amount_collected?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="text-gray-500">Progresso</div>
              <div className="text-lg font-medium">{raffle.progress_pct?.toFixed(1) || "0"}%</div>
            </div>
            <div className="p-3 rounded-lg border col-span-2">
              <div className="text-gray-500">Sorteio</div>
              <div className="text-lg font-medium">
                {raffle.draw_date ? new Date(raffle.draw_date).toLocaleString() : "—"}
              </div>
            </div>
          </div>

          <PayoutSummary 
            raffleId={raffle.id} 
            amountCollected={raffle.amount_collected ?? (raffle.paid_tickets * raffle.ticket_price)} 
          />

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
            <div>Subtotal: <span className="font-medium">R$ {totalAmount.toFixed(2)}</span></div>
            {provider === "asaas" && (
              <div>Taxa Asaas: <span className="font-medium">R$ {feeAmount.toFixed(2)}</span></div>
            )}
            <div className="font-semibold text-base pt-1 border-t mt-1">
              Total: <span className="font-semibold">R$ {grandTotal.toFixed(2)}</span>
            </div>
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