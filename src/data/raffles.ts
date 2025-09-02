import { supabase } from '@/integrations/supabase/client';
import { safeSelect, clampProgress, safeProgressFetch } from '@/lib/safeSelect';

export type BaseRaffle = {
  id: string;
  user_id: string;
  title: string | null;
  status: string | null;
  goal_amount: number | null;
  image_url: string | null;
  created_at: string;
};

export type RaffleWithProgress = BaseRaffle & {
  amount_raised: number;
  progress_pct_money: number;
};

async function enrichProgress(ids: string[]) {
  if (!ids.length) return new Map<string, { amount_raised: number; progress_pct_money: number }>();
  const { data, error } = await safeSelect(
    supabase.from('raffles_public_money_ext'),
    'id,amount_raised,progress_pct_money'
  ).in('id', ids);
  if (error) throw error;
  return new Map<string, { amount_raised: number; progress_pct_money: number }>(
    (data ?? []).map((r: any) => [r.id, {
      amount_raised: r.amount_raised ?? 0,
      progress_pct_money: r.progress_pct_money ?? 0
    }])
  );
}

/** NEW: generic launched fetch with optional status filter */
export async function getLaunchedWithProgress(
  userId: string,
  statuses?: string[] | null,
  limit = 100
): Promise<RaffleWithProgress[]> {
  return safeProgressFetch(async () => {
    let q = safeSelect(
      supabase.from('raffles'),
      'id,user_id,title,status,goal_amount,image_url,created_at'
    )
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
      progress_pct_money: clampProgress(pmap.get(r.id)?.progress_pct_money),
    }));
  }, []);
}

/** keep the old names as thin wrappers (backcompat) */
export const getMyLaunchedWithProgress = (userId: string) =>
  getLaunchedWithProgress(userId, ['active','completed']);

export const getPublicLaunchedWithProgress = (userId: string) =>
  getLaunchedWithProgress(userId, ['active','completed']);