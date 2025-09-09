import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type RecentWinner = {
  raffle_id: string;
  ticket_id: string;
  ticket_number: string | null;
  user_id: string | null;
  drawn_number: string;
  delta: number;
  concurso_number: string;
  draw_date: string;   // ISO date
  picked_at: string;   // created_at
  raffle_title?: string | null;
  raffle_image_url?: string | null;
  direct_purchase_link?: string | null;
  winner_name?: string | null;        // optional if RLS blocks it
  winner_avatar_url?: string | null;  // optional if RLS blocks it
};

export function useRecentWinners(limit = 50) {
  return useQuery({
    queryKey: ['winners', 'recent', limit],
    queryFn: async (): Promise<RecentWinner[]> => {
      const { data, error } = await supabase
        .from('raffle_winners')
        .select(`
          raffle_id,
          ticket_id,
          ticket_number,
          user_id,
          drawn_number,
          delta,
          concurso_number,
          draw_date,
          created_at,
          raffles:raffle_id ( title, image_url, direct_purchase_link ),
          profiles:user_id ( full_name, avatar_url )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      return (data ?? []).map((row: any) => ({
        raffle_id: row.raffle_id,
        ticket_id: row.ticket_id,
        ticket_number: row.ticket_number ?? null,
        user_id: row.user_id ?? null,
        drawn_number: row.drawn_number,
        delta: row.delta ?? 0,
        concurso_number: row.concurso_number,
        draw_date: row.draw_date,
        picked_at: row.created_at,
        raffle_title: row.raffles?.title ?? null,
        raffle_image_url: row.raffles?.image_url ?? null,
        direct_purchase_link: row.raffles?.direct_purchase_link ?? null,
        winner_name: row.profiles?.full_name ?? null,
        winner_avatar_url: row.profiles?.avatar_url ?? null,
      })) as RecentWinner[];
    },
    staleTime: 15_000,
  });
}