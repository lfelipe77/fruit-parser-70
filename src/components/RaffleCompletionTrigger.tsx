import { useEffect, useRef } from 'react';
import { useRaffleCompletionDetector } from '@/hooks/useRaffleCompletionDetector';
import { devLog } from '@/utils/devUtils';

/**
 * Component to manually trigger completion check for a specific raffle
 * Useful for immediate completion detection when a user performs an action
 */
interface RaffleCompletionTriggerProps {
  raffleId: string;
  onCompletion?: (raffleId: string) => void;
  enabled?: boolean;
}

export function RaffleCompletionTrigger({ 
  raffleId, 
  onCompletion,
  enabled = true 
}: RaffleCompletionTriggerProps) {
  const didRun = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const { triggerCheck } = useRaffleCompletionDetector({
    raffleId,
    enabled,
    checkInterval: 10000, // Check every 10 seconds for specific raffle
    onCompletion: onCompletion ? (id, details) => {
      devLog.info(`[CompletionTrigger] Raffle ${id} completed:`, details);
      onCompletion(id);
    } : undefined
  });

  // Trigger immediate check on mount with debounce and run-once guard
  useEffect(() => {
    if (didRun.current || !enabled || !raffleId) return;
    didRun.current = true;
    
    devLog.info(`[CompletionTrigger] Triggering immediate check for raffle: ${raffleId}`);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounced trigger with slight delay to avoid race conditions
    timeoutRef.current = setTimeout(triggerCheck, 200);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [raffleId, enabled, triggerCheck]);

  return null; // This component doesn't render anything
}