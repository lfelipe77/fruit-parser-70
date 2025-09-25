import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Local type so we don't block on DB types
export interface PublicWinnerCard {
  winner_id: number;
  raffle_id: string;
  raffle_title: string | null;
  ticket_id: string;
  user_id: string | null;
  winner_handle: string;   // now enriched by pub view
  avatar_url: string | null;
  federal_target: string;
  winning_ticket: string;
  concurso_number: string | null;
  draw_date: string | null;
  logged_at: string;
}

export function usePublicWinners(limit = 50) {
  const [data, setData] = useState<PublicWinnerCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Fetch from the new enriched view
      const { data, error } = await supabase
        .from('v_public_winners_pubnames')
        .select('*')
        .order('draw_date', { ascending: false, nullsFirst: false })
        .order('logged_at', { ascending: false })
        .limit(limit);
      
      if (!cancelled) {
        if (error) setError(error.message);
        else {
          // UI fallback for empty avatar strings
          const winners = (data as PublicWinnerCard[] ?? []).map(w => ({
            ...w,
            avatar_url: w.avatar_url && w.avatar_url.trim() !== '' ? w.avatar_url : null,
          }));
          setData(winners);
        }
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { data, error, loading };
}