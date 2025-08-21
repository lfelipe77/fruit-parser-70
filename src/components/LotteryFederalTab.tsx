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

  useEffect(() => {
    (async () => {
      try {
        // Use a simple query directly to the database with any() cast for compatibility
        const { data, error } = await (supabase as any)
          .from('federal_draws')
          .select('concurso_number, draw_date, prizes')
          .order('draw_date', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          setErr(error.message);
        } else if (data) {
          // Extract numbers from the first prize if available
          const numbers = data.prizes && Array.isArray(data.prizes) && data.prizes.length > 0 
            ? data.prizes[0].numbers || []
            : [];
          setRow({
            concurso_number: data.concurso_number,
            draw_date: data.draw_date,
            numbers: numbers
          });
        } else {
          setRow(null);
        }
      } catch (error) {
        setErr(String(error));
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-sm opacity-70">Carregando último sorteio…</div>;
  if (err) return <div className="text-sm text-red-600">Erro: {err}</div>;
  if (!row) return <div className="text-sm opacity-70">Sem dados disponíveis.</div>;

  const dataStr = dateBR(row.draw_date);
  const numeros = Array.isArray(row.numbers) ? row.numbers.join(" ") : "";

  return (
    <div className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white">
      <h3 className="text-lg font-semibold">Último sorteio — Loteria Federal</h3>
      <div className="mt-1 text-sm">
        Concurso <span className="font-medium">{row.concurso_number ?? "-"}</span>
        {dataStr ? ` – ${dataStr}` : ""}
      </div>
      <div className="mt-2 text-base font-semibold">
        Números: <span className="font-mono">{numeros || "-"}</span>
      </div>
    </div>
  );
}