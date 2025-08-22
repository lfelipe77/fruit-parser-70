import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  raffle_id: string | null;
  raffle_title: string | null;
  winner_public_handle: string | null;
  concurso_number: string | null;
  draw_date: string | null;
  draw_pairs: string[] | null;
  log_created_at: string | null;
};

function dateBR(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

export default function WinnersList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("v_federal_winners")
        .select("*")
        .order("log_created_at", { ascending: false })
        .limit(20);
      if (error) setErr(error.message);
      setRows((data as Row[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-sm opacity-70">Carregando ganhadores…</div>;
  if (err) return <div className="text-sm text-red-600">Erro: {err}</div>;
  if (!rows?.length) {
    return (
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="text-lg font-semibold">Nenhum resultado disponível ainda.</div>
        <div className="mt-1 text-sm opacity-70">Os resultados aparecerão aqui após os sorteios.</div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((r, i) => {
        const pares = Array.isArray(r.draw_pairs) ? r.draw_pairs.join(" ") : "-";
        const dataStr = dateBR(r.draw_date);
        return (
          <div key={i} className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold">{r.raffle_title ?? "Ganhável"}</h4>
              <span className="text-xs rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">Verificado</span>
            </div>
            <div className="mt-1 text-sm opacity-80">{r.winner_public_handle ?? "Ganhador ****"}</div>
            <div className="mt-3 text-sm">
              <div>Números: <span className="font-mono">{pares}</span></div>
              <div>Concurso {r.concurso_number ?? "-"}{dataStr ? ` — ${dataStr}` : ""}</div>
            </div>
            <div className="mt-4">
              {r.raffle_id ? (
                <a
                  className="inline-flex rounded-lg border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
                  href={`#/ganhaveis/${r.raffle_id}`}
                >
                  Ver sorteio
                </a>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}