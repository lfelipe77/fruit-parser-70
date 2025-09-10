import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRaffleWinner(raffleId?: string, enabled = true) {
  return useQuery({
    queryKey: ['raffle-winner', raffleId],
    enabled: Boolean(raffleId) && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_public_raffle_winner_detail')
        .select('*')
        .eq('raffle_id', raffleId!)
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}