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

async function fetchStats(userId: string): Promise<ProfileStats> {
  if (!userId?.trim()) {
    console.debug('[ProfileStats] No userId provided');
    return EMPTY_STATS;
  }

  console.debug('[ProfileStats] Fetching stats for userId:', userId);

  try {
    // TODO: Replace with actual RPC call when get_profile_stats is created
    // For now, return mock data with the expected structure
    console.warn('[ProfileStats] Using mock data - RPC get_profile_stats needs to be created');
    
    const result = {
      launched: 0,
      participating: 0,
      completed_financed: 0,
      wins: 0,
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
  // Get current user ID from auth context
  const { user } = useAuth();
  return useProfileStats(user?.id);
}

export function usePublicProfileStats(userId: string) {
  return useProfileStats(userId);
}