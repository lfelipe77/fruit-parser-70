import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Feature flag for safe profile stats
const PROFILE_STATS_SAFE = true;

export type ProfileStats = {
  launched: number;
  completed: number;
  awarded: number;
  participated: number | null; // null when not available
};

const DEFAULT_STATS: ProfileStats = {
  launched: 0,
  completed: 0,
  awarded: 0,
  participated: null
};

export function useProfileStatsSafe(userId: string, isSelf: boolean = false) {
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!PROFILE_STATS_SAFE || !userId) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);

        // Parallel fetch all stats
        const queries = await Promise.allSettled([
          // a) launched: COUNT(*) FROM public.raffles WHERE organizer_id = :userId
          supabase
            .from('raffles')
            .select('id', { count: 'exact', head: true })
            .eq('organizer_id', userId),

          // b) completed: raffles at 100% progress (we'll filter out winners in processing)
          supabase
            .from('raffles')
            .select('id', { count: 'exact', head: true })
            .eq('organizer_id', userId)
            .gte('progress_pct_money', 100),

          // c) awarded: get all winners to count later
          supabase
            .from('v_federal_winners')
            .select('raffle_id'),

          // d) participated: only if isSelf, otherwise skip
          isSelf ? 
            supabase
              .from('my_tickets_ext_v7')
              .select('raffle_id', { count: 'exact', head: true })
              .eq('tx_status', 'paid') :
            Promise.resolve({ count: null, error: null })
        ]);

        // Process results with safe defaults
        const launched = queries[0].status === 'fulfilled' ? 
          Math.max(0, queries[0].value.count || 0) : 0;

        // For completed, we get the count but will need to fetch user's raffles to filter out winners
        const completedRaw = queries[1].status === 'fulfilled' ? 
          Math.max(0, queries[1].value.count || 0) : 0;

        // For awarded, count unique raffle_ids where user is organizer
        let awarded = 0;
        let completed = completedRaw;
        
        if (queries[2].status === 'fulfilled' && queries[2].value.data) {
          // Get user's raffle IDs that have winners
          const { data: userRaffles } = await supabase
            .from('raffles')
            .select('id')
            .eq('organizer_id', userId);
            
          if (userRaffles) {
            const userRaffleIds = userRaffles.map(r => r.id);
            const winnersData = queries[2].value.data as { raffle_id: string }[];
            const awardedRaffleIds = winnersData
              .filter(w => userRaffleIds.includes(w.raffle_id))
              .map(w => w.raffle_id);
            
            awarded = new Set(awardedRaffleIds).size;
            // Subtract awarded from completed since they overlap
            completed = Math.max(0, completedRaw - awarded);
          }
        }

        const participated = isSelf && queries[3].status === 'fulfilled' ? 
          Math.max(0, queries[3].value.count || 0) : null;

        // Log any errors in dev mode
        if (import.meta.env.DEV) {
          queries.forEach((result, index) => {
            if (result.status === 'rejected') {
              console.warn(`[useProfileStatsSafe] Query ${index} failed:`, result.reason);
            }
          });
        }

        const finalStats = {
          launched,
          completed,
          awarded,
          participated
        };

        // Dev logging to verify stats are working
        if (import.meta.env.DEV) {
          console.log('[useProfileStatsSafe] Stats loaded:', finalStats, 'for user:', userId);
        }

        setStats(finalStats);

      } catch (error) {
        console.warn('[useProfileStatsSafe] Error fetching stats:', error);
        setStats(DEFAULT_STATS);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, isSelf]);

  return { stats, loading };
}