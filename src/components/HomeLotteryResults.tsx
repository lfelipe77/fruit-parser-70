import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type LotteryResult = {
  concurso_number: string | null;
  draw_date: string | null;
  numbers: string[] | null;
};

function formatDateBR(dateStr: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
}

export default function HomeLotteryResults() {
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("lottery_latest_federal")
          .select("concurso_number, draw_date, numbers")
          .order("draw_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          setError(error.message);
        } else {
          setResult(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar resultado");
      } finally {
        setLoading(false);
      }
    };

    fetchLatestResult();
  }, []);

  if (loading) {
    return (
      <section className="py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <div className="text-sm opacity-70">Carregando resultado...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !result) {
    return null; // Don't show anything if there's an error or no data
  }

  const numbersString = Array.isArray(result.numbers) 
    ? result.numbers.map(n => String(n).padStart(2, "0")).join(" ")
    : "";

  const formattedDate = formatDateBR(result.draw_date);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="rounded-xl border border-border bg-card p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
            <span className="text-base">📢</span>
            <span>Resultado da Loteria Federal mais recente</span>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Concurso {result.concurso_number || "-"}{formattedDate ? ` - ${formattedDate}` : ""}
          </div>
          {numbersString && (
            <div className="mt-2 text-sm">
              <span className="text-muted-foreground">Números sorteados: </span>
              <span className="font-mono font-medium">{numbersString}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}