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
    queryKey: ['completed_unpicked'],
    queryFn: async (): Promise<CompletedRaffle[]> => {
      // 1) "Completed" by your current logic: active + 100%
      const { data: raffles, error: e1 } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,image_url,goal_amount,amount_raised,progress_pct_money,participants_count,draw_date,last_paid_at')
        .eq('status', 'active')
        .eq('progress_pct_money', 100)
        .order('draw_date', { ascending: true });
      
      if (e1) throw e1;

      // 2) All winners (only need raffle_id)
      const { data: winners, error: e2 } = await (supabase as any)
        .from('v_federal_winners')
        .select('raffle_id');
      
      if (e2) throw e2;

      // Debug logging
      console.debug('completed candidates', raffles?.length, raffles);
      console.debug('winners (raffle_ids)', winners?.length, winners?.map((w: any) => w.raffle_id));

      const winnerIds = new Set((winners ?? []).map((w: any) => w.raffle_id));
      const unpicked = (raffles ?? []).filter((r: any) => !winnerIds.has(r.id));
      
      // Optional: Add date guard - only show raffles funded before latest draw
      const { data: latest } = await supabase
        .from('lottery_latest_federal_store')
        .select('draw_date')
        .eq('game_slug', 'federal')
        .limit(1)
        .maybeSingle();

      if (latest?.draw_date) {
        const filtered = unpicked.filter((r: any) => {
          if (!r.last_paid_at) return true; // include if no last_paid_at date
          return new Date(r.last_paid_at) <= new Date(latest.draw_date);
        });
        console.debug('after date filter', filtered?.length, filtered);
        return filtered;
      }

      console.debug('final unpicked', unpicked?.length, unpicked);
      return unpicked;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}