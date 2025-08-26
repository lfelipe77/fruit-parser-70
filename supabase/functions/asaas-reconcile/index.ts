import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.53.0?target=deno";
import { withCORS } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

interface ReconcileRequest {
  providerPaymentId: string;
}

/**
 * Asaas Payment Reconciliation
 * 
 * Re-checks payment status with Asaas API and updates our database.
 * Used when webhook might have been missed.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const apiKey = Deno.env.get('ASAAS_API_KEY');
    if (!apiKey) {
      console.error('[AsaasReconcile] Missing ASAAS_API_KEY environment variable');
      return new Response('Server configuration error', { status: 500 });
    }

    const body: ReconcileRequest = await req.json();
    
    if (!body.providerPaymentId) {
      return new Response(JSON.stringify({
        error: 'providerPaymentId é obrigatório'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AsaasReconcile] Reconciling payment:', body.providerPaymentId);

    // Fetch current status from Asaas
    const asaasResponse = await fetch(`https://api-sandbox.asaas.com/v3/payments/${body.providerPaymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const responseData = await asaasResponse.json();

    if (!asaasResponse.ok) {
      console.error('[AsaasReconcile] Failed to fetch payment from Asaas:', responseData);
      return new Response(JSON.stringify({
        error: responseData.errors?.[0]?.description || 'Erro ao consultar pagamento'
      }), {
        status: asaasResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map Asaas status to our internal status
    const statusMapping: { [key: string]: string } = {
      'PENDING': 'created',
      'AWAITING_PAYMENT': 'created',
      'RECEIVED': 'received',
      'CONFIRMED': 'confirmed',
      'OVERDUE': 'overdue',
      'REFUNDED': 'refunded'
    };

    const internalStatus = statusMapping[responseData.status] || 'unknown';

    console.log('[AsaasReconcile] Asaas status:', responseData.status, '-> internal:', internalStatus);

    // Update our database
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: internalStatus,
        updated_at: new Date().toISOString(),
        payload: responseData
      })
      .eq('provider_payment_id', body.providerPaymentId);

    if (updateError) {
      console.error('[AsaasReconcile] Failed to update database:', updateError);
      return new Response(JSON.stringify({
        error: 'Erro ao atualizar status no banco de dados'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AsaasReconcile] Successfully reconciled payment:', body.providerPaymentId);

    return new Response(JSON.stringify({
      status: internalStatus,
      asaasStatus: responseData.status,
      updatedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[AsaasReconcile] Reconciliation error:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

serve(withCORS(handler));