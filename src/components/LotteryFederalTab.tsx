import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  concurso_number: string | null;
  draw_date: string | null;
  numbers: (string | number)[] | null;
};

function dateBR(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("pt-BR");
}

// Convert to 2-digit pairs (last two digits). If already pairs, keep them (pad to 2).
function toPairs(nums: (string | number)[] | null | undefined): string[] {
  if (!Array.isArray(nums)) return [];
  return nums.map((x) => {
    const s = String(x).replace(/\D/g, ""); // keep digits only
    if (s.length <= 2) return s.padStart(2, "0");
    return s.slice(-2).padStart(2, "0");
  });
}

export default function LotteryFederalTab() {
  const [row, setRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await (supabase as any)
        .from("lottery_latest_federal")
        .select("concurso_number, draw_date, numbers")
        .maybeSingle();

      if (error) setErr(error.message);
      setRow((data as Row) ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-sm opacity-70">Carregando último sorteio…</div>;
  if (err) return <div className="text-sm text-red-600">Erro: {err}</div>;
  if (!row) return <div className="text-sm opacity-70">Sem dados disponíveis.</div>;

  const dataStr = dateBR(row.draw_date);
  const pares = toPairs(row.numbers).join(" ");

  return (
    <div className="rounded-2xl border border-gray-200 p-4 shadow-sm bg-white text-center">
      <h3 className="text-lg font-semibold">Último sorteio — Loteria Federal</h3>
      <div className="mt-1 text-sm">
        Concurso <span className="font-medium">{row.concurso_number ?? "-"}</span>
        {dataStr ? ` – ${dataStr}` : ""}
      </div>
      <div className="mt-2 text-base font-semibold">
        Números: <span className="font-mono tracking-wide">{pares || "-"}</span>
      </div>
    </div>
  );
}