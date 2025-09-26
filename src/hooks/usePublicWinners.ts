import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Local type so we don't block on codegen
export type PublicWinnerCard = {
  winner_id?: number;
  raffle_id: string;
  raffle_title: string;
  ticket_id?: string;
  user_id?: string | null;
  winner_handle?: string | null;
  winner_name?: string | null;
  winner_avatar_url?: string | null;  // IMPORTANT
  federal_target?: string;
  winning_ticket?: string;
  draw_date?: string | null;
  logged_at?: string | null;
  prize_position?: number | null;
  drawn_number?: string | null;
  draw_pairs?: string | null;
  concurso_number?: string | null;
};

const normalizeUrl = (u?: string | null) =>
  u && u.trim() !== '' ? u : undefined;

export async function fetchPublicWinners(supabase: any): Promise<PublicWinnerCard[]> {
  // 1) anon-safe enriched view with specific columns
  let { data, error } = await supabase
    .from('v_public_winners_pubnames')
    .select('winner_handle, winner_name, winner_avatar_url, raffle_title, draw_date, logged_at, prize_position, drawn_number, draw_pairs, concurso_number, raffle_id, ticket_id, user_id, winner_id, federal_target, winning_ticket')
    .order('draw_date', { ascending: false, nullsFirst: false })
    .order('logged_at', { ascending: false })
    .limit(50);

  // 2) fallback to legacy view if the new one doesn't exist (dev/stage)
  if (error && (error.code === '42P01' || /does not exist/i.test(error.message))) {
    console.warn('[Premiados] Falling back to v_public_winners due to', error);
    const res = await supabase
      .from('v_public_winners')
      .select('*')
      .order('draw_date', { ascending: false, nullsFirst: false })
      .order('logged_at', { ascending: false })
      .limit(50);
    error = res.error;
    data = res.data ?? [];
  }

  if (error) {
    console.error('[Premiados] fetch error', error);
    throw error;
  }

  // Normalize for UI with proper avatar handling
  const rows = (data ?? []).map(r => ({
    ...r,
    winner_avatar_url: normalizeUrl(r.winner_avatar_url),
    winner_handle: r.winner_handle?.trim() || null,
    winner_name: r.winner_name?.trim() || null,
  }));

  return rows;
}

export function usePublicWinners(limit = 50) {
  const [data, setData] = useState<PublicWinnerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | { code?: string; message: string }>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      
      try {
        const winners = await fetchPublicWinners(supabase);
        if (!cancelled) {
          setData(winners);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError({
            code: (err as any)?.code,
            message: err instanceof Error ? err.message : 'Unknown error'
          });
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [limit]);

  return { data, error, loading };
}