import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CompletionCallback = (raffleId: string, details: {
  title: string;
  progress_pct_money: number;
  status: string;
}) => void;

interface UseRaffleCompletionDetectorOptions {
  raffleId?: string;
  onCompletion?: CompletionCallback;
  onStatusChange?: (raffleId: string, newStatus: string, details: any) => void;
  checkInterval?: number; // milliseconds
  enabled?: boolean;
}

export function useRaffleCompletionDetector({
  raffleId,
  onCompletion,
  onStatusChange,
  checkInterval = 30000, // 30 seconds
  enabled = true
}: UseRaffleCompletionDetectorOptions = {}) {
  const lastStatusRef = useRef<{ [key: string]: { status: string; progress: number } }>({});
  const intervalRef = useRef<NodeJS.Timeout>();

  const checkRaffleCompletion = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('raffles_public_money_ext')
        .select('id, title, status, progress_pct_money, amount_raised, goal_amount')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`[CompletionDetector] Error checking raffle ${id}:`, error);
        return;
      }

      if (!data) return;

      const currentProgress = Math.min(100, Math.max(0, Number(data.progress_pct_money) || 0));
      const currentStatus = data.status || 'unknown';
      const lastState = lastStatusRef.current[id];

      // Log for debugging
      if (import.meta.env.DEV) {
        console.log(`[CompletionDetector] Checking ${id}: ${currentProgress}% (${currentStatus})`);
      }

      // Update our tracking
      lastStatusRef.current[id] = {
        status: currentStatus,
        progress: currentProgress
      };

      // Check for completion (100% reached but not yet completed status)
      if (currentProgress >= 100 && 
          currentStatus === 'active' && 
          (!lastState || lastState.progress < 100)) {
        
        console.log(`[CompletionDetector] 🎉 Raffle ${id} just reached 100%!`);
        
        // Show completion notification
        toast.success(`🎉 "${data.title}" atingiu 100%! Aguardando próximo sorteio da Loteria Federal.`, {
          duration: 10000,
          action: {
            label: 'Ver Resultados',
            onClick: () => window.open('/resultados', '_blank')
          }
        });

        // Call completion callback
        if (onCompletion) {
          onCompletion(id, {
            title: data.title || 'Ganhavel',
            progress_pct_money: currentProgress,
            status: currentStatus
          });
        }

        // Dispatch global event for other components
        window.dispatchEvent(new CustomEvent('raffleCompleted', {
          detail: {
            raffleId: id,
            title: data.title,
            progress: currentProgress,
            status: currentStatus,
            data
          }
        }));
      }

      // Check for any status change
      if (lastState && 
          (lastState.status !== currentStatus || Math.abs(lastState.progress - currentProgress) >= 5)) {
        
        console.log(`[CompletionDetector] Status/progress change for ${id}: ${lastState.status}(${lastState.progress}%) → ${currentStatus}(${currentProgress}%)`);
        
        if (onStatusChange) {
          onStatusChange(id, currentStatus, {
            title: data.title,
            progress_pct_money: currentProgress,
            previous: lastState,
            current: { status: currentStatus, progress: currentProgress }
          });
        }

        // Dispatch update event
        window.dispatchEvent(new CustomEvent('raffleUpdated', {
          detail: {
            raffleId: id,
            freshData: data
          }
        }));
      }

    } catch (error) {
      console.error(`[CompletionDetector] Error in checkRaffleCompletion for ${id}:`, error);
    }
  };

  const checkAllActiveRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles_public_money_ext')
        .select('id, title, status, progress_pct_money')
        .in('status', ['active', 'drawing'])
        .gte('progress_pct_money', 90) // Only check raffles close to completion
        .order('progress_pct_money', { ascending: false })
        .limit(20);

      if (error) {
        console.error('[CompletionDetector] Error checking active raffles:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log(`[CompletionDetector] Checking ${data.length} active raffles near completion`);
        for (const raffle of data) {
          await checkRaffleCompletion(raffle.id);
        }
      }
    } catch (error) {
      console.error('[CompletionDetector] Error in checkAllActiveRaffles:', error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // Skip if tab is hidden
    if (document.visibilityState !== 'visible') {
      console.log('[CompletionDetector] Skipping - tab hidden');
      return;
    }

    // Initial check
    if (raffleId) {
      checkRaffleCompletion(raffleId);
    } else {
      checkAllActiveRaffles();
    }

    // Set up interval
    intervalRef.current = setInterval(() => {
      // Don't poll when tab is hidden
      if (document.visibilityState !== 'visible') {
        console.log('[CompletionDetector] Skipping interval - tab hidden');
        return;
      }
      
      if (raffleId) {
        checkRaffleCompletion(raffleId);
      } else {
        checkAllActiveRaffles();
      }
    }, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [raffleId, enabled, checkInterval]);

  // Manual trigger function
  const triggerCheck = () => {
    if (raffleId) {
      checkRaffleCompletion(raffleId);
    } else {
      checkAllActiveRaffles();
    }
  };

  return {
    triggerCheck,
    checkRaffleCompletion,
    checkAllActiveRaffles
  };
}