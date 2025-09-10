import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';

export interface MyProfile {
  id: string;
  username?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

export function useMyProfile() {
  const { user } = useAuthContext();
  
  return useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async (): Promise<MyProfile | null> => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id,username,avatar_url,role')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching my profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Not authenticated')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}