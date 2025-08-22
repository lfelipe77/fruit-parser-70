import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-center text-sm text-muted-foreground">
          Carregando sessão…
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    const back = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/login?redirectTo=${back}`} replace />;
  }

  return <>{children}</>;
}