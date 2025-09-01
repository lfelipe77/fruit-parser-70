import { useState, useEffect, useCallback } from 'react';
import { isFollowing, toggleFollow, getUserFollowCounts } from '@/lib/follows';
import { supabase } from '@/lib/supabase';

type Counts = { followers_count: number; following_count: number };

export function useFollow(profileUserId: string) {
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [counts, setCounts] = useState<Counts>({ followers_count: 0, following_count: 0 });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const me = auth?.user?.id || null;
      const [f, c] = await Promise.all([
        me ? isFollowing(profileUserId) : Promise.resolve(false),
        getUserFollowCounts(profileUserId),
      ]);
      setFollowing(!!f);
      setCounts(c);
    } finally {
      setLoading(false);
    }
  }, [profileUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  const onToggle = useCallback(async () => {
    setLoading(true);
    try {
      const result = await toggleFollow(profileUserId);
      setFollowing(result.following);
      // optimistic: adjust counts locally
      setCounts((prev) => ({
        followers_count: result.following ? prev.followers_count + 1 : Math.max(prev.followers_count - 1, 0),
        following_count: prev.following_count,
      }));
    } finally {
      setLoading(false);
    }
  }, [profileUserId]);

  return { loading, following, counts, refresh, onToggle };
}