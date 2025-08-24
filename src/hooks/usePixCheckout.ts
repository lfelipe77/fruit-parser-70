import { useState } from 'react';
import { reserveTickets, createPixPayment, getPaymentStatus, CustomerInfo } from '@/services/checkout';

type Step = 'idle' | 'reserving' | 'charging' | 'waiting' | 'confirmed' | 'error';

interface CheckoutState {
  step: Step;
  error?: string;
  qr?: {
    encodedImage: string;
    payload: string;
    expiresAt: string;
  };
  payment_id?: string;
  reservation_id?: string;
}

interface StartParams {
  raffleId: string;
  qty: number;
  amount: number;
  customer: CustomerInfo;
}

export function usePixCheckout({ supabase, edgeUrl }: { supabase: any; edgeUrl: string }) {
  const [state, setState] = useState<CheckoutState>({ step: 'idle' });

  const updateState = (updates: Partial<CheckoutState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  async function start({ raffleId, qty, amount, customer }: StartParams) {
    try {
      // Step 1: Reserve tickets
      updateState({ step: 'reserving', error: undefined });
      console.log('[PixCheckout] Reserving tickets...', { raffleId, qty });
      
      const reservationResult = await reserveTickets(supabase, raffleId, qty);
      const reservation_id = reservationResult?.reservation_id;
      
      if (!reservation_id) {
        throw new Error('Falha ao reservar bilhetes - ID de reserva não retornado');
      }

      console.log('[PixCheckout] Tickets reserved:', reservation_id);

      // Step 2: Create PIX payment
      updateState({ step: 'charging', reservation_id });
      console.log('[PixCheckout] Creating PIX payment...', { reservation_id, amount });
      
      const session = (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const paymentResult = await createPixPayment(edgeUrl, session.access_token, reservation_id, amount, customer);
      const { payment_id, qr } = paymentResult;

      if (!payment_id || !qr) {
        throw new Error('Falha ao criar pagamento PIX - dados incompletos do servidor');
      }

      // Validate QR data structure
      if (!qr.encodedImage || !qr.payload || !qr.expiresAt) {
        throw new Error('Dados do QR Code PIX incompletos');
      }

      console.log('[PixCheckout] PIX payment created:', payment_id);

      updateState({
        step: 'waiting',
        qr,
        payment_id,
      });

      // Step 3: Poll for payment confirmation
      console.log('[PixCheckout] Starting payment polling...');
      const deadline = Date.now() + 15 * 60_000; // 15 minutes
      let pollAttempts = 0;
      const maxPolls = 300; // 15 min / 3s = 300 attempts

      while (Date.now() < deadline && pollAttempts < maxPolls) {
        try {
          const statusResult = await getPaymentStatus(edgeUrl, payment_id);
          console.log('[PixCheckout] Payment status:', statusResult.status);

          if (statusResult.status === 'RECEIVED' || statusResult.status === 'CONFIRMED') {
            updateState({ step: 'confirmed' });
            console.log('[PixCheckout] Payment confirmed!');
            return { payment_id, reservation_id };
          }

          if (statusResult.status === 'OVERDUE' || statusResult.status === 'REFUNDED') {
            throw new Error(`Pagamento ${statusResult.status === 'OVERDUE' ? 'expirado' : 'estornado'}`);
          }

          // Wait 3 seconds before next poll
          await new Promise(resolve => setTimeout(resolve, 3000));
          pollAttempts++;
        } catch (pollError) {
          console.warn('[PixCheckout] Poll error (continuing):', pollError);
          // Show user-friendly message for network issues but continue polling
          if (pollAttempts % 10 === 0) { // Every 30 seconds
            console.info('[PixCheckout] Aguardando confirmação. Verificando novamente...');
          }
          await new Promise(resolve => setTimeout(resolve, 3000));
          pollAttempts++;
        }
      }

      throw new Error('Tempo expirado aguardando confirmação do PIX.');
    } catch (e: any) {
      console.error('[PixCheckout] Error:', e);
      updateState({ 
        step: 'error',
        error: e?.message || String(e)
      });
      throw e;
    }
  }

  const reset = () => {
    setState({ step: 'idle' });
  };

  const retry = async (params: StartParams) => {
    reset();
    return start(params);
  };

  return { 
    state, 
    start, 
    reset, 
    retry,
    isLoading: ['reserving', 'charging', 'waiting'].includes(state.step),
    isWaiting: state.step === 'waiting',
    isError: state.step === 'error',
    isConfirmed: state.step === 'confirmed'
  };
}