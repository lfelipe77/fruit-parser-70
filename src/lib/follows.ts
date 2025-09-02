import { supabase } from '@/lib/supabase';
const sb = supabase as any;

// Logged-in user counts
export async function getMyFollowCounts() {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw new Error('Not signed in');

  const [followers, following] = await Promise.all([
    sb.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', uid),
    sb.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', uid),
  ]);

  if (followers.error) throw followers.error;
  if (following.error) throw following.error;

  return {
    followers_count: followers.count ?? 0,
    following_count: following.count ?? 0,
  };
}

// Any user counts
export async function getUserFollowCounts(userId: string) {
  const [followers, following] = await Promise.all([
    sb.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    sb.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);
  if (followers.error) throw followers.error;
  if (following.error) throw following.error;
  return {
    followers_count: followers.count ?? 0,
    following_count: following.count ?? 0,
  };
}

// Is current user following target?
export async function isFollowing(themId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user?.id;
  if (!me) throw new Error('Not signed in');

  const { data, error } = await sb
    .from('user_follows')
    .select('id')
    .eq('follower_id', me)
    .eq('following_id', themId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

// Toggle follow/unfollow
export async function toggleFollow(themId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user?.id;
  if (!me) throw new Error('Not signed in');

  const following = await isFollowing(themId);

  if (following) {
    const { error } = await sb
      .from('user_follows')
      .delete()
      .eq('follower_id', me)
      .eq('following_id', themId);
    if (error) throw error;
    return { following: false } as const;
  } else {
    const { error } = await sb
      .from('user_follows')
      .insert({ follower_id: me, following_id: themId });
    if (error) throw error;
    return { following: true } as const;
  }
}
