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
      const { data, error } = await (supabase as any)
        .from('v_eligible_completed_raffles')
        .select(`
          id, title, image_url, goal_amount, amount_raised,
          progress_pct_money, participants_count, draw_date, last_paid_at
        `)
        .order('last_paid_at', { ascending: false });
      
      if (error) throw error;
      console.debug('[Resultados] completas loaded:', data?.length, data);
      return data || [];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}