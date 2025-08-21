/**
 * IMPORTANT: Do not change the data source.
 * This tab must read ONLY from the view `public.lottery_latest_federal`.
 * The view already joins/casts everything we need for display.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  concurso_number: string | null;
  draw_date: string | null;
  numbers: string[] | null;
};

function dateBR(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

export default function LotteryFederalTab() {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function fetchLatest() {
    const { data, error } = await (supabase as any)
      .from("lottery_latest_federal")        // ← keep this view
      .select("concurso_number, draw_date, numbers")
      .maybeSingle();

    if (error) setErr(error.message);
    setRow(data ?? null);
    setLoading(false);
  }

  useEffect(() => { fetchLatest(); }, []);

  if (loading) return <div className="text-sm opacity-70">Carregando último sorteio…</div>;

  return (
    <div className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold">Último sorteio — Loteria Federal</h3>

      {err && <div className="mt-1 text-sm text-red-600">Erro: {err}</div>}

      {!row ? (
        <div className="mt-2 text-sm opacity-70">
          Sem dados disponíveis.
          <button
            className="ml-2 text-xs underline"
            onClick={() => { setLoading(true); setErr(null); fetchLatest(); }}
          >
            Recarregar
          </button>
        </div>
      ) : (
        <>
          <div className="mt-1 text-sm">
            Concurso <span className="font-medium">{row.concurso_number ?? "-"}</span>
            {row.draw_date ? ` – ${dateBR(row.draw_date)}` : ""}
          </div>
          <div className="mt-2 text-base font-semibold">
            Números: <span className="font-mono">{Array.isArray(row.numbers) ? row.numbers.join(" ") : "-"}</span>
          </div>
        </>
      )}
    </div>
  );
}