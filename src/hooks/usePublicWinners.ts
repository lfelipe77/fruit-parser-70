import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Local type so we don't block on codegen
type PublicWinnerCard = {
  winner_id: number;
  raffle_id: string;
  raffle_title: string | null;
  ticket_id: string;
  user_id: string | null;
  winner_handle: string;
  avatar_url: string | null;
  federal_target: string;
  winning_ticket: string;
  concurso_number: string | null;
  draw_date: string | null;
  logged_at: string;
};

export async function fetchPublicWinners(supabase: any): Promise<PublicWinnerCard[]> {
  // Try the new anon-safe view first
  console.log('Fetching from v_public_winners_pubnames...');
  let q = supabase
    .from('v_public_winners_pubnames')
    .select('*')
    .order('draw_date', { ascending: false, nullsFirst: false })
    .order('logged_at', { ascending: false })
    .limit(50);

  let { data, error } = await q;
  
  if (error) {
    console.log('Error from v_public_winners_pubnames:', error);
  } else {
    console.log('Success from v_public_winners_pubnames, sample data:', data?.slice(0, 2));
  }

  // Fallback if migrating / local envs don't have the new view yet
  if (error && (error.code === '42P01' || /relation .* does not exist/i.test(error.message))) {
    console.log('Falling back to v_public_winners...');
    const res = await supabase
      .from('v_public_winners')
      .select('*')
      .order('draw_date', { ascending: false, nullsFirst: false })
      .order('logged_at', { ascending: false })
      .limit(50);
    data = res.data ?? [];
    console.log('Fallback data sample:', data?.slice(0, 2));
  }

  // Normalize empty avatar strings
  const result = (data ?? []).map(w => ({ ...w, avatar_url: w.avatar_url?.trim() ? w.avatar_url : null }));
  console.log('Final processed data sample:', result?.slice(0, 2));
  return result;
}

export function usePublicWinners(limit = 50) {
  const [data, setData] = useState<PublicWinnerCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const winners = await fetchPublicWinners(supabase);
        if (!cancelled) {
          setData(winners);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
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