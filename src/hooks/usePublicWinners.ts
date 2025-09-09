import { useEffect, useState } from 'react';
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
  const [data, setData] = useState<PublicWinner[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('v_public_winners')
        .select('*')
        .order('draw_date', { ascending: false, nullsFirst: false })
        .order('logged_at', { ascending: false })
        .limit(limit);
      if (!cancelled) {
        if (error) setError(error.message);
        else setData(data as any);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { data, error, loading };
}