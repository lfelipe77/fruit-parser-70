import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CompletedRaffle = {
  id: string;
  title: string;
  image_url: string | null;
  goal_amount: number;
  amount_raised: number;
  progress_pct_money: number;
  participants_count: number;
  draw_date: string | null;
  last_paid_at: string | null;
};

export function useCompletedUnpickedRaffles() {
  return useQuery({
    queryKey: ['completed-unpicked'],
    queryFn: async (): Promise<CompletedRaffle[]> => {
      // Since v_eligible_completed_raffles might not be working correctly,
      // let's query directly for 100% complete raffles without winners
      const { data, error } = await supabase
        .from('raffles_public_money_ext')
        .select(`
          id, title, image_url, goal_amount, amount_raised,
          progress_pct_money, participants_count, draw_date, last_paid_at,
          status
        `)
        .gte('progress_pct_money', 100)
        .eq('status', 'active')
        .order('last_paid_at', { ascending: false });
      
      if (error) {
        console.error('[Resultados] Error loading completed raffles:', error);
        throw error;
      }
      
      // Filter out raffles that already have winners in lottery_results
      if (data && data.length > 0) {
        const raffleIds = data.map(r => r.id);
        const { data: existingResults } = await supabase
          .from('lottery_results')
          .select('ganhavel_id')
          .in('ganhavel_id', raffleIds);
        
        const rafflesWithWinners = new Set(existingResults?.map(r => r.ganhavel_id) || []);
        
        const filteredData = data.filter(raffle => !rafflesWithWinners.has(raffle.id));
        console.debug('[Resultados] completas loaded:', filteredData?.length, filteredData);
        return filteredData || [];
      }
      
      console.debug('[Resultados] completas loaded: 0 (no data)');
      return [];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}