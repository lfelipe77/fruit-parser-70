import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/money";
import { useNavigate } from "react-router-dom";

type RaffleRow = {
  id: string;
  title: string;
  owner_user_id: string;
  status: string;
  ticket_price: number;
  total_tickets: number;
  paid_tickets: number;
  amount_collected: number; // from raffles_public view (EXCLUDES fees)
};

type Payout = {
  id: string;
  raffle_id: string;
  created_at: string;
  gross_amount: number;
  provider_fee_total: number;
  commission_pct: number;
  commission_amount: number;
  net_amount: number;
  settled_at: string | null;
};

export default function AdminPayouts() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [raffles, setRaffles] = useState<RaffleRow[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        // check admin
        const uid = session?.user?.id;
        if (!uid) return;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", uid)
          .maybeSingle();
        setIsAdmin(profile?.role === 'admin');

        // Admin: load all; Owner: load only own via base table + join view
        let { data: list, error } = await supabase
          .from("raffles_public")
          .select("id, title, owner_user_id, status, ticket_price, total_tickets, paid_tickets, amount_collected")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw error;

        setRaffles((list || []) as RaffleRow[]);

        const { data: payList, error: payErr } = await supabase
          .from("payouts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (payErr) throw payErr;

        setPayouts((payList || []) as Payout[]);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Falha ao carregar dados.");
      } finally {
        setLoading(false);
      }
    })();
  }, [session?.user?.id]);

  const byRaffleId: Record<string, Payout[]> = useMemo(() => {
    const map: Record<string, Payout[]> = {};
    for (const p of payouts) {
      map[p.raffle_id] ||= [];
      map[p.raffle_id].push(p);
    }
    return map;
  }, [payouts]);

  async function finalize(raffleId: string) {
    try {
      setFinalizing(raffleId);
      const { data, error } = await supabase.rpc("finalize_payout", { p_raffle_id: raffleId });
      if (error) throw error;
      // reload payouts
      const { data: payList } = await supabase
        .from("payouts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setPayouts((payList || []) as Payout[]);
      alert("Payout criado com sucesso.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Erro ao finalizar payout.");
    } finally {
      setFinalizing(null);
    }
  }

  if (!session) return <div className="p-6">Faça login.</div>;
  if (loading) return <div className="p-6">Carregando…</div>;
  if (err) return <div className="p-6 text-destructive">{err}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <button className="text-sm underline" onClick={() => navigate(-1)}>← Voltar</button>
      </div>

      <div className="rounded-lg border">
        <div className="px-4 py-3 font-medium border-b bg-muted">Rifas (resumo)</div>
        <div className="divide-y">
          {raffles.map(r => {
            const gross = r.amount_collected; // EXCLUI taxas do comprador
            const comm = Math.round((gross * 0.02) * 100) / 100;
            const net  = gross - comm;
            const hasPayouts = (byRaffleId[r.id]?.length || 0) > 0;
            return (
              <div key={r.id} className="px-4 py-3 grid md:grid-cols-7 gap-2 items-center">
                <div className="md:col-span-2">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">#{r.id.slice(0,8)} · {r.status}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Vendidos</div>
                  <div className="font-medium">{r.paid_tickets}/{r.total_tickets}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Bruto</div>
                  <div className="font-medium">{brl(gross)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Comissão (2%)</div>
                  <div className="font-medium">{brl(comm)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Líquido</div>
                  <div className="font-medium">{brl(net)}</div>
                </div>
                <div className="text-right">
                  <button
                    className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm disabled:opacity-60"
                    disabled={finalizing === r.id || r.paid_tickets === 0}
                    onClick={() => finalize(r.id)}
                    title={hasPayouts ? "Já possui payout(s), pode criar outro para ajustes/auditoria" : "Finalizar payout"}
                  >
                    {finalizing === r.id ? "Processando…" : hasPayouts ? "Novo Payout" : "Finalizar Payout"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="px-4 py-3 font-medium border-b bg-muted">Payouts gerados</div>
        <div className="divide-y">
          {payouts.length === 0 && <div className="px-4 py-3 text-sm text-muted-foreground">Nenhum payout ainda.</div>}
          {payouts.map(p => (
            <div key={p.id} className="px-4 py-3 grid md:grid-cols-6 gap-2">
              <div className="md:col-span-2">
                <div className="font-medium">Payout #{p.id.slice(0,8)}</div>
                <div className="text-xs text-muted-foreground">Rifa #{p.raffle_id.slice(0,8)} · {new Date(p.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Bruto</div>
                <div className="font-medium">{brl(p.gross_amount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Taxas (comprador)</div>
                <div className="font-medium">{brl(p.provider_fee_total)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Comissão ({(p.commission_pct*100).toFixed(2)}%)</div>
                <div className="font-medium">{brl(p.commission_amount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Líquido</div>
                <div className="font-medium">{brl(p.net_amount)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}