import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { safeFetch } from '@/lib/net';

// Hook para registrar visitas em páginas públicas
export const usePublicVisitLogger = () => {
  const location = useLocation();
  const lastLoggedPath = useRef<string | null>(null);

  useEffect(() => {
    // Client-side only
    if (typeof window === 'undefined') return;

    // Gate behind environment flag
    if (import.meta.env.VITE_ENABLE_VISIT_LOGGER !== 'true') return;

    // Avoid duplicates (React StrictMode double-invoke and quick re-renders)
    if (lastLoggedPath.current === location.pathname) return;
    lastLoggedPath.current = location.pathname;

    const url = `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/visit-logger?p=${encodeURIComponent(location.pathname)}`;

    // Fire-and-forget with timeout and error handling
    if (import.meta.env.VITE_ENABLE_VISIT_LOGGER === 'true') {
      try {
        safeFetch(url, { method: 'POST', keepalive: true }, 4000, 'visit-logger')
          .then(res => {
            if (!res.ok) console.warn('[visit-logger] non-ok', res.status);
          })
          .catch((error) => {
            console.warn('[visit-logger] failed', error);
          });
      } catch (error) {
        console.warn('[visit-logger] failed', error);
      }
    }
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