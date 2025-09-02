import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getMyProfile, getPublicProfile } from '@/lib/profileUtils';
import { useAuthContext } from '@/providers/AuthProvider';
import type { Profile, PublicProfile } from '@/lib/profileValidation';

export function useUnifiedProfile(userId?: string) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  // Determine if we're fetching our own profile or someone else's
  const isOwnProfile = !userId || userId === user?.id;
  const queryKey = ['profile', userId ?? 'me'];
  
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Profile | PublicProfile> => {
      if (isOwnProfile) {
        return await getMyProfile();
      } else {
        return await getPublicProfile(userId!);
      }
    },
    enabled: isOwnProfile ? !!user : !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (replaces cacheTime in newer TanStack Query)
    retry: (failureCount, error) => {
      // Don't retry if not authenticated or profile not found
      if (error.message?.includes('Not authenticated') || 
          error.message?.includes('Profile not found')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Set up realtime subscription for current user's profile updates
  useEffect(() => {
    if (!isOwnProfile || !user) return;

    const channel = supabase
      .channel('profile-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('[useUnifiedProfile] Profile updated via realtime:', payload);
          // Invalidate and refetch the profile query
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOwnProfile, user?.id, queryKey, queryClient]);

  // Convenience methods for profile operations
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!isOwnProfile) {
      throw new Error('Cannot update another user\'s profile');
    }
    
    // Optimistically update the cache
    queryClient.setQueryData(queryKey, (oldData: Profile | undefined) => {
      if (!oldData) return oldData;
      return { ...oldData, ...updates };
    });

    try {
      const { updateMyProfile } = await import('@/lib/profileUtils');
      const updatedProfile = await updateMyProfile(updates);
      
      // Update cache with server response
      queryClient.setQueryData(queryKey, updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey });
      throw error;
    }
  };

  const refreshProfile = () => {
    return query.refetch();
  };

  const invalidateProfile = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    // Convenience properties
    isOwnProfile,
    isAdmin: isOwnProfile && (query.data as Profile)?.role === 'admin',
    // Methods
    updateProfile: isOwnProfile ? updateProfile : undefined,
    refreshProfile,
    invalidateProfile,
  };
}

// Type-safe hooks for specific use cases
export function useMyProfile() {
  return useUnifiedProfile();
}

export function usePublicProfile(userId: string) {
  return useUnifiedProfile(userId);
}