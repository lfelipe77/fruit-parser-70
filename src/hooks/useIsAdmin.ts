import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';

export function useIsAdmin() {
  const { user } = useAuthContext();
  
  const query = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_admin', { p_uid: user.id });
        
        if (error) {
          console.error('Error checking admin status:', error);
          return false;
        }
        
        return data ?? false;
      } catch (error) {
        console.error('Error in is_admin RPC:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry admin checks
  });
  
  return {
    isAdmin: query.data ?? false,
    isLoading: query.isLoading,
    error: query.error,
  };
}