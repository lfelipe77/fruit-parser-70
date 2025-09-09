import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CompletedRaffle = {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  status: string;
  draw_date: string | null;
  updated_at: string;
  raffle_winners: any[] | null;
};

// Raffles that are ready to pick (funded/drawing) and don't yet have a winner row
export function useCompletedUnpickedRaffles() {
  return useQuery({
    queryKey: ['raffles', 'completed-unpicked'],
    queryFn: async (): Promise<CompletedRaffle[]> => {
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
      return (data as unknown as CompletedRaffle[]) ?? [];
    },
    staleTime: 15_000,
  });
}