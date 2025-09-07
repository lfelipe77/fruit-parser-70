import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRaffleCompletionDetector } from '@/hooks/useRaffleCompletionDetector';
import { toast } from 'sonner';

/**
 * Global component to monitor all active raffles for completion
 * This should be included once in the app root
 */
export function GlobalRaffleCompletionMonitor() {
  const navigate = useNavigate();

  // Monitor all active raffles
  useRaffleCompletionDetector({
    checkInterval: 30000, // Check every 30 seconds
    enabled: true,
    onCompletion: (raffleId, details) => {
      console.log(`[GlobalMonitor] 🎉 Raffle completed: ${raffleId}`, details);
      
      // Show a more prominent completion notification
      toast.success(
        `🏆 "${details.title}" está completo! Aguardando sorteio da Loteria Federal.`,
        {
          duration: 15000,
          action: {
            label: 'Ver Completos',
            onClick: () => navigate('/resultados?tab=completas')
          }
        }
      );
    },
    onStatusChange: (raffleId, newStatus, details) => {
      console.log(`[GlobalMonitor] Status change for ${raffleId}: ${newStatus}`, details);
      
      // Handle specific status changes
      if (newStatus === 'completed' && details.previous?.status !== 'completed') {
        toast.info(
          `✅ "${details.title}" foi finalizado e já tem ganhador!`,
          {
            duration: 10000,
            action: {
              label: 'Ver Premiados',
              onClick: () => navigate('/resultados?tab=premiados')
            }
          }
        );
      }
    }
  });

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