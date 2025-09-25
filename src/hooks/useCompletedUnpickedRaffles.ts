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
      // Execute both queries in parallel for better performance
      const [baseResult, winnersResult] = await Promise.all([
        supabase
          .from('raffles_public_money_ext')
          .select('id,slug,title,image_url,status,goal_amount,amount_raised,progress_pct_money,participants_count,draw_date,ticket_price,last_paid_at')
          .or('status.eq.drawing,amount_raised.gte.goal_amount')
          .neq('status', 'premiado')
          .order('last_paid_at', { ascending: false, nullsFirst: false }),
        supabase
          .from('v_public_winners')
          .select('raffle_id')
      ]);
      
      if (baseResult.error) {
        console.error('[Resultados] Error loading completed raffles:', baseResult.error);
        throw baseResult.error;
      }
      
      // Create winner set for efficient filtering
      const winnerSet = new Set((winnersResult.data ?? []).map(w => w.raffle_id));
      
      // Filter out raffles that already have winners
      const completas = (baseResult.data ?? []).filter(r => !winnerSet.has(r.id));
      
      const filteredData = completas.map(raffle => ({
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
      return filteredData;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}