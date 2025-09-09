import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Raffles that are ready to pick (funded/drawing) and don't yet have a winner row
export function useCompletedUnpickedRaffles() {
  return useQuery({
    queryKey: ['raffles', 'completed-unpicked'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select([
          'id','title','description','image_url','status','draw_date','updated_at',
          // left-join winners; we only want rows where the join is null
          'raffle_winners!left(raffle_id)'
        ].join(','))
        .in('status', ['funded','drawing'])
        .is('raffle_winners.raffle_id', null)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 15_000,
  });
}