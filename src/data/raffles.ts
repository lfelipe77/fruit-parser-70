import { supabase } from '@/lib/supabase';

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
  const { data, error } = await (supabase as any)
    .from('raffles_public_money_ext')
    .select('id,amount_raised,progress_pct_money')
    .in('id', ids);
  if (error) throw error;
  return new Map<string, { amount_raised: number; progress_pct_money: number }>(
    (data ?? []).map((r: any) => [r.id, {
      amount_raised: r.amount_raised ?? 0,
      progress_pct_money: r.progress_pct_money ?? 0
    }])
  );
}

export async function getMyLaunchedWithProgress(userId: string): Promise<RaffleWithProgress[]> {
  const { data: base, error } = await (supabase as any)
    .from('raffles')
    .select('id,user_id,title,status,goal_amount,image_url,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  const ids = (base ?? []).map((r: BaseRaffle) => r.id);
  const pmap = await enrichProgress(ids);
  return (base ?? []).map((r: BaseRaffle) => ({
    ...r,
    amount_raised: pmap.get(r.id)?.amount_raised ?? 0,
    progress_pct_money: pmap.get(r.id)?.progress_pct_money ?? 0,
  }));
}

export async function getPublicLaunchedWithProgress(profileUserId: string): Promise<RaffleWithProgress[]> {
  const { data: base, error } = await (supabase as any)
    .from('raffles')
    .select('id,user_id,title,status,goal_amount,image_url,created_at')
    .eq('user_id', profileUserId)
    .in('status', ['active','completed'])
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  const ids = (base ?? []).map((r: BaseRaffle) => r.id);
  const pmap = await enrichProgress(ids);
  return (base ?? []).map((r: BaseRaffle) => ({
    ...r,
    amount_raised: pmap.get(r.id)?.amount_raised ?? 0,
    progress_pct_money: pmap.get(r.id)?.progress_pct_money ?? 0,
  }));
}