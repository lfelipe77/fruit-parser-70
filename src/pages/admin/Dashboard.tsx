import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type MoneyRow = {
  id: string;
  amount_raised: number | null;
  participants_count: number | null;
  last_paid_at: string | null;
  created_at: string | null;
};

type TxAgg = { count: number };

const PAID = ["paid","settled","confirmed","approved","success","succeeded"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<MoneyRow[]>([]);
  const [tx7d, setTx7d] = useState<number>(0);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // 1) Pull recent raffles from the money view
      const { data: vdata, error: verr } = await (supabase as any)
        .from("raffles_public_money_ext")
        .select("id, amount_raised, participants_count, last_paid_at, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (verr) console.error("[AdminDashboard] view error:", verr);
      setRows(vdata ?? []);

      // 2) Last 7 days successful transactions count
      const since = new Date(Date.now() - 7*24*3600*1000).toISOString();
      const { data: txdata, error: txerr } = await (supabase as any)
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .in("status", PAID)
        .gte("created_at", since);
      if (txerr) console.error("[AdminDashboard] tx 7d error:", txerr);
      setTx7d(txdata?.length ? txdata.length : (txdata as any)?.count ?? (txerr ? 0 : 0)); // head:true => count in header; some libs return count on .count property

      setLoading(false);
    })();
  }, []);

  const totals = useMemo(() => {
    let totalRaised = 0;
    let totalParticipants = 0;
    for (const r of rows) {
      totalRaised += Number(r.amount_raised ?? 0);
      totalParticipants += Number(r.participants_count ?? 0);
    }
    return { totalRaised, totalParticipants };
  }, [rows]);

  // Active raffles count from view by progress / presence (approx) – or add a status select if exposed
  const totalRaffles = rows.length;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardStat title="Ganhavéis (total)" value={totalRaffles} loading={loading} />
        <CardStat title="Total arrecadado" value={formatBRL(totals.totalRaised)} loading={loading} />
        <CardStat title="Participantes (estimado)" value={totals.totalParticipants} loading={loading} />
        <CardStat title="Transações (últimos 7 dias)" value={tx7d} loading={loading} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="font-semibold mb-3">Rifas recentes</h2>
        <div className="text-sm opacity-80">Últimas 10 por criação</div>
        <table className="w-full text-sm mt-3">
          <thead className="text-left opacity-60">
            <tr>
              <th className="py-2">ID</th>
              <th>Arrecadado</th>
              <th>Participantes</th>
              <th>Última compra</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).slice(0,10).map(r => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="py-2">{r.id.slice(0,8)}…</td>
                <td>{formatBRL(Number(r.amount_raised ?? 0))}</td>
                <td>{Number(r.participants_count ?? 0)}</td>
                <td>{r.last_paid_at ? timeAgo(r.last_paid_at) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function CardStat({ title, value, loading }: { title: string; value: any; loading?: boolean}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs opacity-70">{title}</div>
      <div className="text-2xl font-semibold mt-1">{loading ? "…" : value}</div>
    </div>
  );
}
function formatBRL(n: number) {
  try { return n.toLocaleString("pt-BR",{ style:"currency", currency:"BRL" }); }
  catch { return `R$ ${n.toFixed(2)}`; }
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff/3600000);
  if (h < 1) return "agora";
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h/24);
  return `${d}d atrás`;
}