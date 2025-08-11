import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

// Hook para registrar visitas em páginas públicas
export const usePublicVisitLogger = () => {
  const location = useLocation();

  useEffect(() => {
    const logVisit = async () => {
      try {
        // Capturar dados da visita
        const visitData = {
          url: location.pathname, // only path, no querystring
          user_agent: navigator.userAgent,
          referer: document.referrer || undefined,
        };

        // Chamar a edge function para registrar a visita
        const { data, error } = await supabase.functions.invoke('visit-logger', {
          body: visitData
        });

        if (error) {
          console.warn('Failed to log visit:', error);
          return;
        }

        // Log apenas para debug (remover em produção)
        if (data?.logged) {
          console.log('Visit logged successfully:', data.visit_id);
        } else {
          console.log('Visit not logged (rate limited)');
        }

      } catch (error) {
        console.warn('Error logging visit:', error);
      }
    };

    // Fazer log apenas se estivermos no browser
    if (typeof window !== 'undefined') {
      // Adicionar um pequeno delay para garantir que a página carregou
      const timer = setTimeout(logVisit, 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.search]);
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