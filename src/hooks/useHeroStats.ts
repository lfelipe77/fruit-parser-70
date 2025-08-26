import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroStats {
  totalPrizeAmount: number;
  totalParticipants: number;
  totalRaffles: number;
}

export const useHeroStats = () => {
  const [stats, setStats] = useState<HeroStats>({
    totalPrizeAmount: 0,
    totalParticipants: 0,
    totalRaffles: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `R$ ${(amount / 1000000).toFixed(1)}M+`;
    } else if (amount >= 1000) {
      return `R$ ${(amount / 1000).toFixed(0)}K+`;
    }
    return `R$ ${amount.toFixed(0)}`;
  };

  const formatCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}K+`;
    }
    return `${count}+`;
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get total prize amount from paid transactions
        const { data: prizeData, error: prizeError } = await supabase
          .from('payments_verified')
          .select('amount')
          .eq('status', 'verified');

        if (prizeError) {
          console.error('Error fetching prize data:', prizeError);
          throw prizeError;
        }

        const totalPrizeAmount = prizeData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

        // Get total unique participants (users who have made purchases)
        const { data: participantData, error: participantError } = await supabase
          .from('payments_verified')
          .select('buyer_user_id')
          .eq('status', 'verified');

        if (participantError) {
          console.error('Error fetching participant data:', participantError);
          throw participantError;
        }

        const uniqueParticipants = new Set(participantData?.map(p => p.buyer_user_id).filter(Boolean)).size;

        // Get total raffles count (active and completed)
        const { count: raffleCount, error: raffleError } = await supabase
          .from('raffles')
          .select('id', { count: 'exact' })
          .in('status', ['active', 'completed']);

        if (raffleError) {
          console.error('Error fetching raffle count:', raffleError);
          throw raffleError;
        }

        setStats({
          totalPrizeAmount,
          totalParticipants: uniqueParticipants,
          totalRaffles: raffleCount || 0,
        });

      } catch (err) {
        console.error('Error fetching hero stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        
        // Fallback to hardcoded values if there's an error
        setStats({
          totalPrizeAmount: 8000000, // 8M
          totalParticipants: 25000,  // 25K
          totalRaffles: 890,         // 890
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return {
    ...stats,
    loading,
    error,
    formatCurrency,
    formatCount,
  };
};