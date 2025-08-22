import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAuthContext } from '@/providers/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const { user: authUser, initializing } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (initializing) {
        // Don't resolve as false while auth is still initializing
        setLoading(true);
        return;
      }
      
      if (!authUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', authUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else if (!data) {
          console.warn('User profile not found, assuming non-admin role');
          setIsAdmin(false);
        } else {
          setIsAdmin(data.role === 'admin');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && !initializing) {
      checkAdminRole();
    }
  }, [authUser, authLoading, initializing]);

  return { isAdmin, loading: loading || authLoading || initializing };
};