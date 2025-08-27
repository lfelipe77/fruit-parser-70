export type CustomerInfo = {
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
};

export async function reserveTickets(supabase: any, raffleId: string, qty: number) {
  const { data, error } = await supabase.rpc('reserve_tickets_v2', {
    p_raffle_id: raffleId,
    p_qty: qty,
  });
  if (error) throw error;
  return data as { reservation_id: string };
}

export async function createPixPayment(
  edgeUrl: string, 
  accessToken: string, 
  reservation_id: string, 
  amount: number, 
  customer: CustomerInfo
) {
  const res = await fetch(`${edgeUrl}/functions/v1/asaas-payments-complete`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': `Bearer ${accessToken}` 
    },
    body: JSON.stringify({ 
      reservation_id, 
      amount, 
      customer, 
      billingType: 'PIX' 
    }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`asaas-payments-complete ${res.status}: ${errorText}`);
  }
  
  // Expected payload from backend:
  // {
  //   payment_id: string,
  //   qr: { encodedImage: string, payload: string, expiresAt: string },
  //   value: number
  // }
  return res.json();
}

export async function getPaymentStatus(edgeUrl: string, paymentId: string) {
  try {
    const res = await fetch(`${edgeUrl}/functions/v1/payment-status?paymentId=${encodeURIComponent(paymentId)}`);
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.warn(`[getPaymentStatus] ${res.status}: ${errorText}`);
      // Return a safe default status for non-critical errors
      if (res.status === 404 || res.status >= 500) {
        return { status: 'PENDING', providerPaymentId: paymentId };
      }
      throw new Error(`payment-status ${res.status}: ${errorText}`);
    }
    
    // Expected payload: 
    // { 
    //   status: 'PENDING'|'RECEIVED'|'CONFIRMED'|'OVERDUE'|'REFUNDED', 
    //   updatedAt?: string, 
    //   providerPaymentId: string 
    // }
    return res.json();
  } catch (error) {
    console.warn('[getPaymentStatus] Network error:', error);
    // Return pending status for network errors to allow retry
    return { status: 'PENDING', providerPaymentId: paymentId };
  }
}

export async function getReservationAudit(supabase: any, reservationId: string) {
  const { data, error } = await supabase.rpc('get_reservation_audit', {
    p_reservation_id: reservationId,
  });
  if (error) throw error;
  return data;
}