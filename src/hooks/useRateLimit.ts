import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { withTimeout } from '@/lib/net';

type RateLimitAction = 'raffle_creation' | 'login_attempt' | 'signup_attempt';

interface RateLimitResponse {
  allowed?: boolean;
  ok?: boolean;
  remaining?: number;
  resetTime?: string;
  message?: string;
  reason?: string;
}

export const useRateLimit = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = async (
    action: RateLimitAction,
    emailOrIdentifier?: string
  ): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      const { data, error } = await withTimeout(
        supabase.functions.invoke('rate-limiter', {
          body: {
            action,
            // Send email when relevant; server computes identifiers using IP
            email: emailOrIdentifier && typeof emailOrIdentifier === 'string' ? emailOrIdentifier : undefined,
            userAgent: navigator.userAgent,
          },
        }),
        3000,
        'rate-limit'
      );

      if (error) {
        console.error('Rate limit check error:', error);
        // On error, allow the action to proceed to prevent blocking
        return true;
      }

      const response: RateLimitResponse = data || {};

      const allowed = typeof response.allowed === 'boolean' ? response.allowed : (response.ok ?? true);

      if (!allowed) {
        if (response.reason === 'rate_limited') {
          // Specific rate limit case
          toast.error('Você atingiu o limite de tentativas. Tente novamente em instantes.');
        } else {
          const resetTime = response.resetTime ? new Date(response.resetTime) : null;
          const timeUntilReset = resetTime ? Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60)) : 0;
          const message = response.message || `Você atingiu o limite de ações. Tente novamente em ${timeUntilReset} minutos.`;
          toast.error(message, { duration: 5000 });
        }
        return false;
      }

      // Sucesso - mostrar quantas tentativas restam (opcional)
      if (response.remaining !== undefined && response.remaining <= 2) {
        toast.warning(`Atenção: Restam ${response.remaining} tentativas nesta hora.`, {
          duration: 3000,
        });
      }

      return true;
    } catch (error) {
      console.warn('[rate-limit] non-fatal', error);
      // On network or timeout errors, allow the action to proceed
      // This prevents the app from breaking if rate limiting service is down
      return true;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkRateLimit,
    isChecking
  };
};