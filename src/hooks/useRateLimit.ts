import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type RateLimitAction = 'raffle_creation' | 'login_attempt' | 'signup_attempt';

interface RateLimitResponse {
  allowed: boolean;
  remaining?: number;
  resetTime?: string;
  message?: string;
}

export const useRateLimit = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkRateLimit = async (
    action: RateLimitAction,
    identifier: string // IP será obtido automaticamente, mas pode passar user ID também
  ): Promise<boolean> => {
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          action,
          identifier,
          userAgent: navigator.userAgent
        }
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // Em caso de erro na verificação, permita a ação (fail open)
        return true;
      }

      const response: RateLimitResponse = data;

      if (!response.allowed) {
        // Mostrar mensagem de rate limit excedido
        const resetTime = response.resetTime ? new Date(response.resetTime) : null;
        const timeUntilReset = resetTime ? 
          Math.ceil((resetTime.getTime() - Date.now()) / (1000 * 60)) : 0;
        
        const message = response.message || 
          `Você atingiu o limite de ações. Tente novamente em ${timeUntilReset} minutos.`;
        
        toast.error(message, {
          duration: 5000,
        });
        
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
      console.error('Rate limit check failed:', error);
      // Em caso de erro, permita a ação (fail open)
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