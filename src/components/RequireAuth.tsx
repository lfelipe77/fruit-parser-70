import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/providers/AuthProvider';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuthContext();

  // Show loading spinner while checking auth state
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-6 text-sm text-muted-foreground">
          Carregando sessão…
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}