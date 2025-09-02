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

// Default empty stats to prevent undefined errors
const EMPTY_STATS: Stats = { launched: 0, participated: 0, completed: 0, won: 0 };

async function fetchStats(userId: string): Promise<Stats> {
  if (!userId?.trim()) {
    console.debug('[ProfileStats] No userId provided');
    return EMPTY_STATS;
  }

  console.debug('[ProfileStats] Fetching stats for userId:', userId);

  try {
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

    // 3) Participou (distinct por raffle_id) - try known views for resilience
    let participatedRows: any[] = [];
    
    // Try v7 first, fallback to v6
    try {
      const result = await supabase
        .from("my_tickets_ext_v7")
        .select("raffle_id,buyer_user_id")
        .eq("buyer_user_id", userId);
        
      if (!result.error && result.data) {
        participatedRows = result.data;
        console.debug('[ProfileStats] Using view: my_tickets_ext_v7');
      } else {
        // Fallback to v6
        const fallbackResult = await supabase
          .from("my_tickets_ext_v6")
          .select("raffle_id,buyer_user_id")
          .eq("buyer_user_id", userId);
          
        if (!fallbackResult.error && fallbackResult.data) {
          participatedRows = fallbackResult.data;
          console.debug('[ProfileStats] Using view: my_tickets_ext_v6');
        }
      }
    } catch (viewError) {
      console.debug('[ProfileStats] Views failed:', viewError);
    }

    const participated = new Set(
      (participatedRows || [])
        .filter(r => r?.raffle_id) // Ensure raffle_id exists
        .map(r => r.raffle_id)
    ).size;

    // 4) Ganhou - we don't have direct access to winner tables, so return 0 for now
    let won = 0;
    // This would need to be implemented with proper winner tracking in the future

    const [launchedRes, completedRes] = await Promise.all([launchedQ, completedQ]);

    // Validate results and provide safe defaults
    const result = {
      launched: Math.max(0, launchedRes.count ?? 0),
      participated: Math.max(0, participated),
      completed: Math.max(0, completedRes.count ?? 0),
      won: Math.max(0, won),
    };

    console.debug('[ProfileStats] Fetched stats:', result);
    return result;
    
  } catch (error) {
    console.error('[ProfileStats] Error fetching stats:', error);
    // Return empty stats on error to prevent UI breakage
    return EMPTY_STATS;
  }
}

export function useProfileStats(userId?: string | null) {
  return useQuery({
    queryKey: ["profile-stats", userId ?? 'me'],
    queryFn: () => fetchStats(userId || ""),
    enabled: !!userId?.trim(), // Only run if we have a valid userId
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on permission or auth errors
      const errorMessage = error?.message?.toLowerCase() || '';
      if (errorMessage.includes('permission') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('forbidden')) {
        console.debug('[ProfileStats] Not retrying due to auth/permission error');
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    }
  });
}

// Convenience hooks for common use cases
export function useMyProfileStats() {
  return useProfileStats(); // Will use current user
}

export function usePublicProfileStats(userId: string) {
  return useProfileStats(userId);
}