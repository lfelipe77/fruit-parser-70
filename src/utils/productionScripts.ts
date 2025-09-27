// Production-only external scripts loader
import { env } from '@/config/env';

export const loadProductionScripts = () => {
  if (!import.meta.env.PROD) return;

  // Load Google Analytics in production only
  if (env.GA_MEASUREMENT_ID) {
    const gaScript = document.createElement('script');
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${env.GA_MEASUREMENT_ID}`;
    gaScript.async = true;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', env.GA_MEASUREMENT_ID);
  }

  // Load Lovable in production only if enabled
  if (env.ENABLE_LOVABLE === '1') {
    const lovableScript = document.createElement('script');
    lovableScript.src = 'https://cdn.gpteng.co/lovable.js';
    lovableScript.async = true;
    document.head.appendChild(lovableScript);
  }
};

declare global {
  interface Window {
    dataLayer: any[];
  }
}