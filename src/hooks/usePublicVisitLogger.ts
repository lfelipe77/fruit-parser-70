import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Hook para registrar visitas em páginas públicas
export const usePublicVisitLogger = () => {
  const location = useLocation();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    // Client-side only
    if (typeof window === 'undefined') return;

    // Avoid duplicates (React StrictMode double-invoke and quick re-renders)
    if (lastLoggedPath.current === location.pathname) return;
    lastLoggedPath.current = location.pathname;

    const url = `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/visit-logger?p=${encodeURIComponent(location.pathname)}`;

    // Fire-and-forget; ignore errors and send no PII; keepalive for unload navigations
    fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  }, [location.pathname]);
};

// Páginas que devem registrar visitas
export const PUBLIC_PAGES_TO_LOG = [
  '/',
  '/categorias',
  '/como-funciona',
  '/resultados',
  '/descobrir',
  '/sobre-nos',
  '/confianca-seguranca',
  '/trabalhe-conosco',
  '/central-de-ajuda',
  '/ganhaveis-detail',
  '/subcategoria-ganhaveis',
];

// Helper para verificar se uma página deve ser logada
export const shouldLogPage = (pathname: string): boolean => {
  return PUBLIC_PAGES_TO_LOG.some(page => {
    if (page === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(page);
  });
};