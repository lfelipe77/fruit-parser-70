import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type RealTimeRaffleUpdate = {
  paid_tickets: number;
  tickets_remaining: number;
  amount_collected: number;
  progress_pct: number;
  last_paid_at?: string;
};

export const useRealTimeRaffleUpdates = (raffleId: string | undefined) => {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastPaidAt, setLastPaidAt] = useState<string | null>(null);

  useEffect(() => {
    if (!raffleId) return;

    const channel = supabase
      .channel(`raffle-updates-${raffleId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets', 
        filter: `raffle_id=eq.${raffleId}` 
      }, (payload) => {
        console.log('Real-time ticket update:', payload);
        setLastUpdate(new Date());
        
        // If it's a payment completion, set last paid timestamp
        if (payload.eventType === 'INSERT' && payload.new?.is_paid) {
          setLastPaidAt(new Date().toISOString());
        }
      })
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions', 
        filter: `raffle_id=eq.${raffleId}` 
      }, (payload) => {
        console.log('Real-time transaction update:', payload);
        
        // If transaction completed, update last paid timestamp
        if (payload.new && typeof payload.new === 'object' && 'status' in payload.new && payload.new.status === 'completed') {
          setLastPaidAt(new Date().toISOString());
          setLastUpdate(new Date());
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raffleId]);

  const getTimeAgo = (timestamp: string | null): string => {
    if (!timestamp) return '';
    
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return {
    lastUpdate,
    lastPaidAt,
    timeAgo: getTimeAgo(lastPaidAt)
  };
};