import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  action?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
  invisible?: boolean;
}

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
    onloadTurnstileCallback: () => void;
  }
}

export const TurnstileProtection: React.FC<TurnstileProps> = ({
  onVerify,
  onError,
  onExpire,
  action = 'submit',
  theme = 'auto',
  size = 'normal',
  invisible = false
}) => {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAAiL8E8eEjkFr4Yr';

  useEffect(() => {
    // Avoid double loading: if Turnstile is already present (e.g., loaded in index.html), just mark as loaded
    if ((window as any).turnstile) {
      setIsLoaded(true);
      return;
    }

    // If script tag already exists (likely from index.html), wait until it initializes
    const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile/v0/api.js"]') as HTMLScriptElement | null;
    if (existing) {
      const timer = window.setInterval(() => {
        if ((window as any).turnstile) {
          setIsLoaded(true);
          window.clearInterval(timer);
        }
      }, 50);
      return () => window.clearInterval(timer);
    }

    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);

    document.body.appendChild(script);

    return () => {
      // Only remove if we injected it
      const el = document.getElementById('cf-turnstile-script');
      if (el && el === script && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, []);
  useEffect(() => {
    if (isLoaded && window.turnstile && turnstileRef.current && !widgetId) {
      const id = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        action,
        theme,
        size: invisible ? 'invisible' : size,
        callback: (token: string) => {
          console.log('Turnstile verification successful');
          onVerify(token);
        },
        'error-callback': () => {
          console.error('Turnstile verification failed');
          onError?.();
        },
        'expired-callback': () => {
          console.log('Turnstile token expired');
          onExpire?.();
        },
      });
      setWidgetId(id);
    }
  }, [isLoaded, action, theme, size, invisible, onVerify, onError, onExpire, widgetId]);

  const reset = () => {
    if (window.turnstile && widgetId) {
      window.turnstile.reset(widgetId);
    }
  };

  const execute = () => {
    if (invisible && window.turnstile && widgetId) {
      // For invisible captcha, trigger execution
      window.turnstile.reset(widgetId);
    }
  };

  // Expose methods to parent component
  useEffect(() => {
    if (turnstileRef.current) {
      (turnstileRef.current as any).reset = reset;
      (turnstileRef.current as any).execute = execute;
    }
  }, [widgetId]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">Carregando verificação...</span>
      </div>
    );
  }

  return (
    <div className="turnstile-container">
      <div ref={turnstileRef} />
      <p className="text-xs text-muted-foreground mt-2">
        Protegido por Cloudflare Turnstile para prevenir spam e bots.
      </p>
    </div>
  );
};