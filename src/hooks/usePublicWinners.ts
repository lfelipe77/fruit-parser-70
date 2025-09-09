import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PublicWinner = {
  winner_id: string; // Using raffle_id + ticket_id as compound key
  raffle_id: string;
  raffle_title: string | null;
  ticket_id: string;
  user_id: string | null;
  winner_handle: string | null;
  avatar_url: string | null;
  federal_target: string;   // drawn_number from raffle_winners
  winning_ticket: string;   // ticket_number from raffle_winners  
  concurso_number: string | null;
  draw_date: string | null; // ISO date
  logged_at: string;        // created_at from raffle_winners
};

export function usePublicWinners(limit = 50) {
  return useQuery({
    queryKey: ['public_winners', limit],
    queryFn: async (): Promise<PublicWinner[]> => {
      // Try raffle_winners first (real-time), fallback to view if RLS blocks it
      const { data: rawData, error } = await supabase
        .from('raffle_winners')
        .select(`
          raffle_id,
          ticket_id,
          ticket_number,
          user_id,
          drawn_number,
          concurso_number,
          draw_date,
          created_at,
          raffles:raffle_id ( title ),
          profiles:user_id ( full_name, avatar_url )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        // Fallback to materialized view if RLS blocks direct access
        console.warn('[usePublicWinners] RLS blocked raffle_winners, falling back to v_public_winners');
        const { data: viewData, error: viewError } = await (supabase as any)
          .from('v_public_winners')
          .select('*')
          .order('draw_date', { ascending: false, nullsFirst: false })
          .order('logged_at', { ascending: false })
          .limit(limit);
        
        if (viewError) throw viewError;
        return (viewData as any[])?.map(row => ({
          winner_id: String(row.winner_id || `${row.raffle_id}-${row.ticket_id}`),
          raffle_id: row.raffle_id,
          raffle_title: row.raffle_title,
          ticket_id: row.ticket_id,
          user_id: row.user_id,
          winner_handle: row.winner_handle,
          avatar_url: row.avatar_url,
          federal_target: row.federal_target,
          winning_ticket: row.winning_ticket,
          concurso_number: row.concurso_number,
          draw_date: row.draw_date,
          logged_at: row.logged_at,
        })) ?? [];
      }
      
      // Transform raffle_winners data to match PublicWinner format
      return (rawData ?? []).map((row: any) => ({
        winner_id: `${row.raffle_id}-${row.ticket_id}`,
        raffle_id: row.raffle_id,
        raffle_title: row.raffles?.title ?? null,
        ticket_id: row.ticket_id,
        user_id: row.user_id,
        winner_handle: row.profiles?.full_name ?? null,
        avatar_url: row.profiles?.avatar_url ?? null,
        federal_target: row.drawn_number, // Use drawn_number as federal_target
        winning_ticket: row.ticket_number ?? 'N/A',
        concurso_number: row.concurso_number,
        draw_date: row.draw_date,
        logged_at: row.created_at,
      })) as PublicWinner[];
    },
    staleTime: 15_000,
  });
}