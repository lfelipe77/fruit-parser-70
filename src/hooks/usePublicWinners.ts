import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PublicWinner = {
  winner_id: number;
  raffle_id: string;
  raffle_title: string | null;
  ticket_id: string;
  user_id: string | null;
  winner_handle: string | null;
  avatar_url: string | null;
  federal_target: string;   // e.g. "75-78-81-88-84"
  winning_ticket: string;   // e.g. "74-78-81-88-84"
  concurso_number: string | null;
  draw_date: string | null; // ISO date
  logged_at: string;        // ISO timestamp
};

export function usePublicWinners(limit = 50) {
  return useQuery({
    queryKey: ['v_public_winners', limit],
    queryFn: async (): Promise<PublicWinner[]> => {
      const { data, error } = await (supabase as any)
        .from('v_public_winners')
        .select('*')
        .order('draw_date', { ascending: false, nullsFirst: false })
        .order('logged_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return (data as PublicWinner[]) ?? [];
    },
    staleTime: 15_000,
  });
}