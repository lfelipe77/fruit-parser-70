import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LastPathKeeper({ isAuthenticated }: { isAuthenticated: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const firstLoad = useRef(true);

  // Track last non-auth path
  useEffect(() => {
    const path = location.pathname + location.search + location.hash;
    const skip = ["/login", "/signup", "/logout", "/cadastro", "/auth/callback", "/auth-callback"];
    if (!skip.includes(location.pathname)) {
      sessionStorage.setItem("lastPath", path);
    }
  }, [location]);

  // Restore once on first load (respect auth)
  useEffect(() => {
    if (!firstLoad.current) return;
    firstLoad.current = false;

    const saved = sessionStorage.getItem("lastPath");
    if (!saved) return;

    const protectedPrefixes = ["/dashboard", "/profile", "/my-tickets", "/raffles", "/admin", "/gerenciar-", "/alterar-senha"];
    const needsAuth = protectedPrefixes.some(p => saved.startsWith(p));
    if (needsAuth && !isAuthenticated) return;

    const current = location.pathname + location.search + location.hash;
    if (current !== saved) navigate(saved, { replace: true });
  }, [isAuthenticated, location, navigate]);

  return null;
}