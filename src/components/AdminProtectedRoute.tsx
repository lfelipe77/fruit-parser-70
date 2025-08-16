import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [state, setState] = useState<"loading"|"allow"|"deny">("loading");

  useEffect(() => {
    (async () => {
      console.log('[AdminProtectedRoute] Checking admin access for path:', loc.pathname);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[AdminProtectedRoute] No user, denying access');
        return setState("deny");
      }
      console.log('[AdminProtectedRoute] User found:', user.id);
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      console.log('[AdminProtectedRoute] Profile data:', profile);
      const isAdmin = ((profile?.role ?? "") as string).toLowerCase() === "admin";
      console.log('[AdminProtectedRoute] Admin check result:', isAdmin);
      setState(isAdmin ? "allow" : "deny");
    })();
  }, [loc.pathname]);

  if (state === "loading") {
    console.log('[AdminProtectedRoute] Loading state, showing spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (state === "deny") {
    console.log('[AdminProtectedRoute] Access denied, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('[AdminProtectedRoute] Access granted, rendering children');
  return <>{children}</>;
}