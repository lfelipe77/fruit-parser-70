import { useEffect } from 'react';
import { useRaffleCompletionDetector } from '@/hooks/useRaffleCompletionDetector';

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
  const { triggerCheck } = useRaffleCompletionDetector({
    raffleId,
    enabled,
    checkInterval: 10000, // Check every 10 seconds for specific raffle
    onCompletion: onCompletion ? (id, details) => {
      console.log(`[CompletionTrigger] Raffle ${id} completed:`, details);
      onCompletion(id);
    } : undefined
  });

  // Trigger immediate check on mount
  useEffect(() => {
    if (enabled && raffleId) {
      console.log(`[CompletionTrigger] Triggering immediate check for raffle: ${raffleId}`);
      setTimeout(triggerCheck, 1000); // Slight delay to avoid race conditions
    }
  }, [raffleId, enabled, triggerCheck]);

  return null; // This component doesn't render anything
}