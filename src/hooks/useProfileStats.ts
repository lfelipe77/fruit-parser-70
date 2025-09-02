import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ProfileStats = {
  launched: number;
  participating: number;
  completed_financed: number; // Regra A (>=100%)
  wins: number;
};

// Default empty stats to prevent undefined errors
const EMPTY_STATS: ProfileStats = { launched: 0, participating: 0, completed_financed: 0, wins: 0 };

async function fetchStats(userId: string | null): Promise<ProfileStats> {
  try {
    const { data, error } = await (supabase as any)
      .rpc('get_profile_stats', { target_user_id: userId ?? null });

    if (error) throw error;

    const result: ProfileStats = {
      launched: Number((data as any)?.launched ?? 0),
      participating: Number((data as any)?.participating ?? 0),
      completed_financed: Number((data as any)?.completed_financed ?? 0),
      wins: Number((data as any)?.wins ?? 0),
    };

    console.debug('[ProfileStats] rpc', result);
    return result;
  } catch (error) {
    console.error('[ProfileStats] Error fetching stats:', error);
    // Return empty stats on error to prevent UI breakage
    return EMPTY_STATS;
  }
}

export function useProfileStats(userId?: string | null) {
  return useQuery({
    queryKey: ['profileStats', userId ?? 'me'],
    queryFn: () => fetchStats(userId ?? null),
    enabled: true, // Allow null to represent current user on RPC
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: (failureCount, error) => {
      // Don't retry on permission or auth errors
      const errorMessage = (error as any)?.message?.toLowerCase?.() || '';
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
  // Get current user ID from auth context
  const { user } = useAuth();
  return useProfileStats(user?.id);
}

export function usePublicProfileStats(userId: string) {
  return useProfileStats(userId);
}