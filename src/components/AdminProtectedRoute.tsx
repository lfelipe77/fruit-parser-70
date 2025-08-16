import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        console.log('[AdminProtectedRoute] No user, cannot check admin');
        setChecking(false);
        return;
      }

      console.log('[AdminProtectedRoute] Checking admin status for user:', user.id);

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        console.log('[AdminProtectedRoute] Profile query result:', { data, error, userId: user.id });

        if (error) {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else if (!data) {
          console.warn('User profile not found, assuming non-admin role');
          setIsAdmin(false);
        } else {
          const userIsAdmin = (data.role || '').toLowerCase() === 'admin';
          console.log('[AdminProtectedRoute] User role check:', { role: data.role, isAdmin: userIsAdmin });
          setIsAdmin(userIsAdmin);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  // Show loading while checking auth or admin status
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[AdminProtectedRoute] Redirecting to login - no user');
    return <Navigate to="/login" replace />;
  }

  // Redirect to access denied if not admin
  if (isAdmin === false) {
    console.log('[AdminProtectedRoute] Redirecting to access denied - not admin');
    return <Navigate to="/access-denied" replace />;
  }

  console.log('[AdminProtectedRoute] User is admin, rendering children');
  // Render children if user is admin
  return <>{children}</>;
};

export default AdminProtectedRoute;