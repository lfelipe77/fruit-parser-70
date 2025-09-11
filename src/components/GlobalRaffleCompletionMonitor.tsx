import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Global component to monitor raffles using real-time updates
 * Much more efficient than polling - no more blinking!
 */
export function GlobalRaffleCompletionMonitor() {
  const navigate = useNavigate();

  // Use real-time updates instead of polling
  useEffect(() => {
    const channel = supabase
      .channel('raffle-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'raffles_public_money_ext',
          filter: 'status=eq.completed'
        },
        (payload) => {
          console.log('[RealTime] Raffle completed:', payload);
          const raffle = payload.new;
          
          if (raffle) {
            toast.success(
              `🏆 "${raffle.title}" está completo! Aguardando sorteio da Loteria Federal.`,
              {
                duration: 15000,
                action: {
                  label: 'Ver Completos',
                  onClick: () => navigate('/resultados?tab=completas')
                }
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  // Listen for completion events from other parts of the app
  useEffect(() => {
    const handleCompletion = (event: any) => {
      console.log('[GlobalMonitor] Received global completion event:', event.detail);
      
      // You could add additional global completion handling here
      // like analytics tracking, notifications, etc.
    };

    window.addEventListener('raffleCompleted', handleCompletion);
    
    return () => {
      window.removeEventListener('raffleCompleted', handleCompletion);
    };
  }, []);

  // This component doesn't render anything
  return null;
}