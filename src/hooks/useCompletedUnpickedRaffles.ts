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
      // Filter by status to show "completed by money" awaiting draw/pick
      const { data, error } = await supabase
        .from('raffles_public_money_ext')
        .select('id, title, image_url, status, amount_raised, goal_amount, last_paid_at, participants_count, draw_date, progress_pct_money')
        .in('status', ['funded', 'drawing'])
        .order('last_paid_at', { ascending: false, nullsFirst: false });
      
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
        
        const filteredData = data
          .filter(raffle => !rafflesWithWinners.has(raffle.id))
          .map(raffle => ({
            id: raffle.id,
            title: raffle.title,
            image_url: raffle.image_url,
            goal_amount: raffle.goal_amount,
            amount_raised: raffle.amount_raised,
            progress_pct_money: raffle.progress_pct_money,
            participants_count: raffle.participants_count || 0,
            draw_date: raffle.draw_date,
            last_paid_at: raffle.last_paid_at
          }));
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