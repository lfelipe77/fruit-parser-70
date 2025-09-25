import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Local type so we don't block on codegen
export type PublicWinnerCard = {
  winner_id: number;
  raffle_id: string;
  raffle_title: string | null;
  ticket_id: string;
  user_id: string | null;
  winner_handle: string | null;   // <-- use this
  avatar_url: string | null;
  federal_target: string;
  winning_ticket: string;
  concurso_number: string | null;
  draw_date: string | null;
  logged_at: string;
};

export async function fetchPublicWinners(supabase: any): Promise<PublicWinnerCard[]> {
  // 1) anon-safe enriched view
  let { data, error } = await supabase
    .from('v_public_winners_pubnames')
    .select('*')
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

  // Normalize for UI
  return (data ?? []).map(w => ({
    ...w,
    winner_handle: w.winner_handle?.trim() || 'Ganhador Anônimo',
    avatar_url: w.avatar_url?.trim() || null,
  }));
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