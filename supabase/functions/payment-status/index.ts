import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.53.0?target=deno";
import { withCORS } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

interface PaymentStatusResponse {
  status: string;
  updatedAt: string;
  providerPaymentId: string;
}

/**
 * Payment Status Checker
 * 
 * Returns the current status of a payment from our database.
 * Used for frontend polling to check payment status.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Extract payment ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const localPaymentId = pathParts[pathParts.length - 2]; // .../payments/{id}/status

    if (!localPaymentId) {
      return new Response(JSON.stringify({
        error: 'Payment ID é obrigatório'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[PaymentStatus] Checking status for payment:', localPaymentId);

    // Query our database for payment status
    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, updated_at, provider_payment_id')
      .eq('id', localPaymentId)
      .single();

    if (error || !payment) {
      console.error('[PaymentStatus] Payment not found:', localPaymentId);
      return new Response(JSON.stringify({
        error: 'Pagamento não encontrado'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const statusResponse: PaymentStatusResponse = {
      status: payment.status,
      updatedAt: payment.updated_at,
      providerPaymentId: payment.provider_payment_id
    };

    console.log('[PaymentStatus] Status found:', statusResponse.status, 'for payment:', localPaymentId);

    return new Response(JSON.stringify(statusResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[PaymentStatus] Error checking payment status:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

serve(withCORS(handler));