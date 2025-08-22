import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  concurso_number: string | null;
  draw_date: string | null;
  numbers: string[] | null;
};

function dateBR(iso: string | null) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  const d = new Date(iso!);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

export default function LotteryFederalCard() {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("lottery_latest_federal")
        .select("concurso_number, draw_date, numbers")
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        setErr(error.message);
      } else {
        setRow((data as Row) ?? null);
        setLastUpdated(new Date());
        setErr(null);
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Auto-refresh on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
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
                {(() => {
                  const pares = Array.isArray(row.numbers)
                    ? row.numbers.map(s => String(s).padStart(2, "0"))
                    : [];
                  return pares.join(" ") || "-";
                })()}
              </span>
            </div>
            {lastUpdated && (
              <div className="mt-2 text-xs opacity-60">
                Atualizado agora
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}