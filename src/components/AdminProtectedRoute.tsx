
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
    let isMounted = true;
    console.log('🔧 AdminRoute: Auth loading:', loading, 'User:', !!user);

    const checkAdmin = async () => {
      if (!user) {
        if (isMounted) {
          console.log('🔧 AdminRoute: No user, denying access');
          setIsAdmin(false);
          setChecking(false);
        }
        return;
      }

      try {
        console.log('🔧 AdminRoute: Checking admin status for user:', user.id);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.error('🔧 AdminRoute: Error checking admin role:', error);
          setIsAdmin(false);
        } else {
          const isAdminUser = data?.role === 'admin';
          console.log('🔧 AdminRoute: Admin check result:', isAdminUser, 'Role data:', data);
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error('🔧 AdminRoute: Exception checking admin role:', error);
        if (isMounted) {
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    };

    if (!loading) {
      checkAdmin();
    }

    return () => {
      isMounted = false;
    };
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
    return <Navigate to="/login" replace />;
  }

  // Redirect to access denied if not admin
  if (isAdmin === false) {
    return <Navigate to="/access-denied" replace />;
  }

  // Render children if user is admin
  return <>{children}</>;
};

export default AdminProtectedRoute;
