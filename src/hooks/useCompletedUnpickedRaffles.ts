import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CompletedRaffle = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  draw_date: string | null;
  goal_amount: number;
  participants_count?: number;
};

// Returns raffles that are 100% sold (funded/drawing) and DO NOT have a row in raffle_winners
export function useCompletedUnpickedRaffles() {
  return useQuery({
    queryKey: ['raffles', 'completed-unpicked'],
    queryFn: async (): Promise<CompletedRaffle[]> => {
      const { data, error } = await supabase
        .from('raffles')
        .select(`
          id,
          title,
          description,
          image_url,
          status,
          draw_date,
          goal_amount,
          raffle_winners!left(raffle_id)
        `)
        .in('status', ['funded', 'drawing'])
        .is('raffle_winners.raffle_id', null) // only those with NO winner
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[useCompletedUnpickedRaffles] Error:', error);
        throw error;
      }
      
      console.debug('[useCompletedUnpickedRaffles] loaded:', data?.length, data);
      return data ?? [];
    },
    staleTime: 15_000,
  });
}