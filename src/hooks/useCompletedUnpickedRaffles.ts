import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCompletedUnpickedRaffles() {
  return useQuery({
    queryKey: ['completed_unpicked'],
    queryFn: async () => {
      // 1) Get completed raffles that are 100% funded
      const { data: raffles, error: e1 } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,image_url,goal_amount,amount_raised,progress_pct_money,participants_count,draw_date,last_paid_at')
        .eq('status', 'active')
        .eq('progress_pct_money', 100)
        .order('draw_date', { ascending: true });
      
      if (e1) throw e1;

      // 2) Get winners to exclude raffles that already have winners
      const { data: winners, error: e2 } = await (supabase as any)
        .from('v_federal_winners')
        .select('raffle_id');
      
      if (e2) throw e2;

      // 3) Create a Set of raffle IDs that already have winners
      const winnerIds = new Set((winners ?? []).map((w: any) => w.raffle_id));
      
      // 4) Filter out raffles that already have winners
      const unpicked = (raffles ?? []).filter((r: any) => !winnerIds.has(r.id));
      
      // 5) Optional: Add date guard - only show raffles funded before latest draw
      const { data: latest } = await supabase
        .from('lottery_latest_federal_store')
        .select('draw_date')
        .eq('game_slug', 'federal')
        .limit(1)
        .maybeSingle();

      if (latest?.draw_date) {
        return unpicked.filter((r: any) => {
          if (!r.last_paid_at) return true; // include if no last_paid_at date
          return new Date(r.last_paid_at) <= new Date(latest.draw_date);
        });
      }

      return unpicked;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });
}