import { supabase } from '@/integrations/supabase/client';
import { safeSelect, safeProgressFetch, clampPct } from '@/lib/safeSelect';
import type { RaffleWithProgress } from '@/types/raffles';

// Re-export for backward compatibility
export type { RaffleWithProgress };

export type BaseRaffle = {
  id: string;
  user_id: string;
  title: string | null;
  status: string | null;
  goal_amount: number | null;
  image_url: string | null;
  created_at: string;
};

export async function enrichProgress(ids: string[]) {
  if (!ids.length) return new Map<string, { amount_raised: number; progress_pct_money: number }>();
  try {
    const { data, error } = await supabase
      .from('raffles_public_money_ext')
      .select(safeSelect('id,amount_raised,progress_pct_money'))
      .in('id', ids);
    if (error) throw error;
    return new Map(
      (data ?? []).map((r: any) => [r.id, {
        amount_raised: Number(r.amount_raised ?? 0),
        progress_pct_money: clampPct(r.progress_pct_money),
      }]),
    );
  } catch (e) {
    console.error('[progress] fallback to zeros', e);
    return new Map(); // left-merge will show 0%
  }
}

/** NEW: generic launched fetch with optional status filter */
export async function getLaunchedWithProgress(
  userId: string,
  statuses?: string[] | null,
  limit = 100
): Promise<RaffleWithProgress[]> {
  return safeProgressFetch(async () => {
    let q = supabase
      .from('raffles')
      .select(safeSelect('id,user_id,title,status,goal_amount,image_url,created_at'))
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (statuses && statuses.length) {
      q = q.in('status', statuses);
    }

    const { data: base, error } = await q;
    if (error) throw error;

    const ids = (base ?? []).map((r: any) => r.id);
    const pmap = await enrichProgress(ids);

    return (base ?? []).map((r: any) => ({
      ...r,
      amount_raised: pmap.get(r.id)?.amount_raised ?? 0,
      progress_pct_money: clampPct(pmap.get(r.id)?.progress_pct_money ?? 0),
    }));
  }, []);
}

/** keep the old names as thin wrappers (backcompat) */
export const getMyLaunchedWithProgress = (userId: string) =>
  getLaunchedWithProgress(userId, ['active','completed']);

export const getPublicLaunchedWithProgress = (userId: string) =>
  getLaunchedWithProgress(userId, ['active','completed']);