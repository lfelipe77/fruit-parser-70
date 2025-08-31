import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type Row = {
  raffle_id: string | null;
  raffle_title: string | null;
  winner_public_handle: string | null;
  concurso_number: string | null;
  draw_date: string | null;
  draw_pairs: string[] | null;
  log_created_at: string | null;
};

function dateBR(dateStr: string | null) {
  if (!dateStr) return "";
  return dayjs(dateStr, 'YYYY-MM-DD').format('DD/MM/YYYY');
}

function timeBR(iso: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    }).format(new Date(iso!));
  } catch {
    return "";
  }
}

export default function WinnersList({ latestConcurso, latestDate }: { latestConcurso?: string | null; latestDate?: string | null }) {
  const { data: rows, isLoading: loading, error } = useQuery({
    queryKey: ['v_federal_winners', latestConcurso],
    queryFn: async () => {
      const q = (supabase as any)
        .from("v_federal_winners")
        .select("*")
        .order("log_created_at", { ascending: false })
        .limit(20);
      if (latestConcurso) q.eq("concurso_number", latestConcurso);
      const { data, error } = await q;
      if (error) throw error;
      return (data as Row[]) ?? [];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const err = error?.message;

  if (loading) return <div className="text-sm opacity-70">Carregando ganhadores…</div>;
  if (err) return <div className="text-sm text-red-600">Erro: {err}</div>;
  if (!rows?.length) {
    // Show specific message if we're looking for latest concurso but no winners yet
    if (latestConcurso && latestDate) {
      return (
        <div className="mt-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-6 text-center">
          <div className="text-lg font-semibold text-yellow-800">
            Aguardando validação do sorteio mais recente
          </div>
          <div className="mt-1 text-sm text-yellow-700">
            Concurso {latestConcurso} — {dateBR(latestDate)}. Assim que o resultado for confirmado, o ganhador aparecerá aqui.
          </div>
        </div>
      );
    }
    
    return (
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <div className="text-lg font-semibold">Nenhum resultado disponível ainda.</div>
        <div className="mt-1 text-sm opacity-70">Os resultados aparecerão aqui após os sorteios.</div>
      </div>
    );
  }

  // Group by raffle_id to show one card per raffle
  const groupedByRaffle = rows?.reduce((acc, row) => {
    const key = row.raffle_id || 'unknown';
    if (!acc[key]) acc[key] = row;
    return acc;
  }, {} as Record<string, Row>) || {};

  const uniqueRaffles = Object.values(groupedByRaffle);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {uniqueRaffles.map((r, i) => {
        const pares = Array.isArray(r.draw_pairs) ? r.draw_pairs.join(' · ') : "-";
        const dataStr = dateBR(r.draw_date);
        const horaSync = timeBR(r.log_created_at);
        return (
          <div key={i} className="rounded-2xl border border-green-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold">{r.raffle_title ?? "Ganhável"}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">
                  Verificado
                </span>
                {horaSync && (
                  <span className="text-xs opacity-60">
                    Última sync: {horaSync}
                  </span>
                )}
              </div>
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
                  href={`#/ganhavel/${r.raffle_id}`}
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