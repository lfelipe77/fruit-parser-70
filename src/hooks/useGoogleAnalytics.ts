import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Hook para Google Analytics
export const useGoogleAnalytics = (measurementId: string) => {
  const location = useLocation();

  useEffect(() => {
    // Só funciona no cliente
    if (typeof window === 'undefined') return;
    
    // Check if already injected to prevent duplicates
    if (!window.gtag && !document.querySelector('script[src*="gtag/js"]')) {
      console.warn('[GA] Script not found in DOM, analytics may not be working');
      return;
    }
    
    // Verifica se o Google Analytics já foi carregado
    if (!window.gtag) return;

    // Envia pageview para a nova rota
    window.gtag('config', measurementId, {
      page_path: location.pathname + location.search,
    });
  }, [location, measurementId]);
};

// Função para enviar eventos customizados
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};