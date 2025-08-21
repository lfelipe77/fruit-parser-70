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

export default function LotteryFederalCard() {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("lottery_latest_federal") // view in DB
        .select("concurso_number, draw_date, numbers")
        .maybeSingle(); // safe when 0 rows
      if (error) setErr(error.message);
      setRow((data as Row) ?? null);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="mt-6 flex justify-center">
      <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
        <h3 className="text-lg font-semibold">Último sorteio — Loteria Federal</h3>

        {loading && <div className="mt-2 text-sm opacity-70">Carregando…</div>}
        {err && <div className="mt-2 text-sm text-red-600">Erro: {err}</div>}

        {!loading && !err && !row && (
          <div className="mt-2 text-sm opacity-70">Sem dados disponíveis.</div>
        )}

        {!!row && (
          <>
            <div className="mt-1 text-sm">
              Concurso <span className="font-medium">{row.concurso_number ?? "-"}</span>
              {row.draw_date ? ` – ${dateBR(row.draw_date)}` : ""}
            </div>
            <div className="mt-2 text-base font-semibold">
              Números:{" "}
              <span className="font-mono">
                {Array.isArray(row.numbers) ? row.numbers.join(" ") : "-"}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}