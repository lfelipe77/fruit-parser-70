import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { nanoid } from 'nanoid';
import { sanitizeTicketNumbers } from '@/lib/ticketSanitizer';
import { sanitizeFivePairs } from '@/lib/clientTicketSanitizer';
import { isFeatureEnabled } from '@/utils/featureFlags';

interface MockPaymentData {
  raffleId: string;
  quantity: number;
  unitPrice: number;
  selectedNumbers: string[];
}

export function useMockPayment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const processedRef = useRef(false);

  const createMockPayment = async (data: MockPaymentData) => {
    if (!user || processedRef.current) return;
    
    setLoading(true);
    processedRef.current = true;

    try {
      const providerRef = `MOCK_${data.raffleId}_${Date.now()}`;
      const totalAmount = data.quantity * data.unitPrice;

      // Check if transaction already exists (idempotency)
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('provider_payment_id', providerRef)
        .maybeSingle();

      if (existingTx) {
        console.log('Transaction already exists, skipping');
        return;
      }

      // Client-side sanitization to exactly 5 pairs
      const sanitizedNumbers = sanitizeFivePairs(data.selectedNumbers);

      // Insert transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          raffle_id: data.raffleId,
          user_id: user.id,
          amount: totalAmount,
          status: 'paid',
          provider: 'mock',
          provider_payment_id: providerRef,
          selected_numbers: sanitizedNumbers,
          type: 'payment'
        })
        .select('id')
        .single();

      if (txError) {
        console.error('Error creating transaction:', txError);
        return;
      }

      // Insert tickets with sanitized numbers
      const ticketsData = Array.from({ length: data.quantity }, (_, index) => ({
        raffle_id: data.raffleId,
        user_id: user.id,
        quantity: 1,
        total_amount: data.unitPrice,
        status: 'paid' as const,
        transaction_id: transaction.id,
        ticket_number: index + 1,
        numbers: sanitizedNumbers // Add the sanitized numbers to each ticket
      }));

      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(ticketsData);

      if (ticketsError) {
        console.error('Error creating tickets:', ticketsError);
        return;
      }

      console.log('Mock payment created successfully');
    } catch (error) {
      console.error('Error in mock payment:', error);
    } finally {
      setLoading(false);
    }
  };

  return { createMockPayment, loading };
}