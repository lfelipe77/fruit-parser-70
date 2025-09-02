import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  launched: number;     // Ganháveis lançados por este usuário
  participated: number; // Ganháveis que este usuário participou (distintos)
  completed: number;    // Ganháveis do usuário com status finalizado
  won: number;          // Quantas vezes este usuário ganhou
};

const STATUS_LAUNCHED = [
  "active", "completed", "finalizada",
  "paused", "pending_draw", "scheduled"
];

const STATUS_COMPLETED = ["completed", "finalizada", "closed"];

async function fetchStats(userId: string): Promise<Stats> {
  if (!userId) return { launched: 0, participated: 0, completed: 0, won: 0 };

  // 1) Lançados (count exato por status permitido)
  const launchedQ = supabase
    .from("raffles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", STATUS_LAUNCHED);

  // 2) Completos (status final)
  const completedQ = supabase
    .from("raffles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", STATUS_COMPLETED);

  // 3) Participou (distinct por raffle_id)
  // Usamos a view mais nova disponível; se v7 não existir, caímos para v6.
  const participatedV7 = await supabase
    .from("my_tickets_ext_v7")
    .select("raffle_id,buyer_user_id")
    .eq("buyer_user_id", userId);

  const participatedRows = participatedV7.error
    ? (await supabase
        .from("my_tickets_ext_v6")
        .select("raffle_id,buyer_user_id")
        .eq("buyer_user_id", userId)
      ).data ?? []
    : participatedV7.data ?? [];

  const participated = new Set(
    (participatedRows || []).map((r: any) => r.raffle_id)
  ).size;

  // 4) Ganhou (v_federal_winners → fallback raffle_winner_logs)
  let won = 0;
  const winnersTry = await supabase
    .from("v_federal_winners")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (winnersTry.error?.message?.includes("relation") || winnersTry.error?.code === "42P01") {
    // fallback simples por logs (quando houver)
    const logs = await supabase
      .from("raffle_winner_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    won = logs.count ?? 0;
  } else {
    won = winnersTry.count ?? 0;
  }

  const [launchedRes, completedRes] = await Promise.all([launchedQ, completedQ]);

  return {
    launched: launchedRes.count ?? 0,
    participated,
    completed: completedRes.count ?? 0,
    won,
  };
}

export function useProfileStats(userId?: string | null) {
  return useQuery({
    queryKey: ["profile-stats", userId],
    queryFn: () => fetchStats(userId || ""),
    enabled: !!userId,
    staleTime: 30_000,
  });
}