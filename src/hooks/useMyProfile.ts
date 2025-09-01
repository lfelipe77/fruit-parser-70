import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Create a simple query cache for manual invalidation
const queryCache = new Map();
const invalidateQueries = (queryKey: string[]) => {
  const key = JSON.stringify(queryKey);
  queryCache.delete(key);
};

interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  role?: string;
  banned?: boolean;
  total_ganhaveis?: number;
  updated_at?: string;
}

export const useMyProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error: error as Error };
    }
  };

  const refreshProfile = () => {
    invalidateQueries(['my-profile']);
    if (user && !authLoading) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (!error && data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
        }
      };
      fetchProfile();
    }
  };

  return {
    profile,
    loading: loading || authLoading,
    isAdmin,
    updateProfile,
    refreshProfile,
    invalidateQueries
  };
};