import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePersistMock(
  raffleId: string | undefined, 
  qty: number, 
  unitPrice: number, 
  numbers: string[]
) {
  const once = useRef(false);

  useEffect(() => {
    if (once.current || !raffleId || !qty || !unitPrice || numbers.length === 0) return;
    once.current = true;

    const providerRef = `MOCK_${raffleId}_${Date.now()}`;

    const executePurchase = async () => {
      try {
        const result = await supabase.rpc("record_mock_purchase", {
          p_raffle_id: raffleId,
          p_qty: qty,
          p_unit_price: unitPrice,
          p_numbers: numbers,
          p_provider_ref: providerRef,
        });

        if (result.error) {
          console.error('Mock purchase error:', result.error);
        } else {
          console.log('Mock purchase recorded successfully:', result.data);
        }
      } catch (error) {
        console.error('Mock purchase failed:', error);
      }
    };

    executePurchase();
  }, [raffleId, qty, unitPrice, numbers]);
}