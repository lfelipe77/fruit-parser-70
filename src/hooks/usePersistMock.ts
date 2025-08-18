import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function usePersistMock(
  raffleId: string | undefined, 
  qty: number, 
  unitPrice: number, 
  numbers: string[]
) {
  const { user } = useAuth();
  const once = useRef(false);

  useEffect(() => {
    if (once.current || !raffleId || !qty || !unitPrice || numbers.length === 0 || !user?.id) return;
    once.current = true;

    const providerRef = `MOCK_${raffleId}_${Date.now()}`;

    const executePurchase = async () => {
      try {
        const result = await supabase.rpc("record_mock_purchase_admin", {
          p_buyer_user_id: user.id,
          p_raffle_id: raffleId,
          p_qty: qty,
          p_unit_price: unitPrice,
          p_numbers: numbers,
          p_provider_ref: `MOCK_${raffleId}_${Date.now()}`
        });

        if (result.error) {
          console.error('Mock purchase error:', result.error);
        } else {
          console.log('Mock purchase recorded successfully:', result.data);
          
          // Re-fetch backend truth for immediate UI update
          const { data: freshData } = await supabase
            .from('raffles_public_money_ext')
            .select('id, amount_raised, progress_pct_money, last_paid_at')
            .eq('id', raffleId)
            .single();
          
          if (freshData) {
            console.log('Fresh raffle data after payment:', freshData);
            // Trigger a custom event to notify other components
            console.log('Dispatching raffleUpdated event for raffle:', raffleId);
            window.dispatchEvent(new CustomEvent('raffleUpdated', { 
              detail: { raffleId, freshData } 
            }));
            console.log('raffleUpdated event dispatched successfully');
          }
        }
      } catch (error) {
        console.error('Mock purchase failed:', error);
      }
    };

    executePurchase();
  }, [raffleId, qty, unitPrice, numbers, user?.id]);
}