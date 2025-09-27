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
    const uid = userId || null;
    if (!uid) {
      console.debug('[ProfileStats] No user ID provided');
      return EMPTY_STATS;
    }

    console.debug('[ProfileStats] Fetching stats for user:', uid);

    // Get launched count - try both organizer_id and user_id columns
    let launchedCount = 0;
    
    // First try organizer_id
    const { count: launchedCountOrganizer, error: launchedError1 } = await supabase
      .from('raffles')
      .select('id', { count: 'exact', head: true })
      .eq('organizer_id', uid)
      .in('status', ['active', 'completed']);

    // Then try user_id
    const { count: launchedCountUser, error: launchedError2 } = await supabase
      .from('raffles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .in('status', ['active', 'completed']);

    if (launchedError1) {
      console.error('[ProfileStats] Error fetching launched count (organizer_id):', launchedError1);
    }
    if (launchedError2) {
      console.error('[ProfileStats] Error fetching launched count (user_id):', launchedError2);
    }

    launchedCount = Math.max(launchedCountOrganizer ?? 0, launchedCountUser ?? 0);
    console.debug('[ProfileStats] Launched counts - organizer_id:', launchedCountOrganizer, 'user_id:', launchedCountUser, 'final:', launchedCount);

    // Get participating count (transactions with status 'paid') 
    const { count: participatingCount, error: participatingError } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('status', 'paid');

    if (participatingError) {
      console.error('[ProfileStats] Error fetching participating count:', participatingError);
    }

    // Skip wins count for now due to schema issues
    const winsCount = 0;

    console.debug('[ProfileStats] Wins count for user:', uid, 'count:', winsCount);

    const result: ProfileStats = {
      launched: launchedCount,
      participating: participatingCount ?? 0,
      completed_financed: 0, // For now, until we fix the RPC
      wins: winsCount ?? 0,
    };

    console.debug('[ProfileStats] final result:', result);
    return result;
  } catch (error) {
    console.error('[ProfileStats] Error fetching stats:', error);
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