import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";

interface AsaasPaymentRequest {
  customerId: string;
  value: number;
  description?: string;
  dueDate?: string;
}

interface AsaasPaymentResponse {
  id: string;
  status: string;
  value: number;
  dueDate: string;
}

/**
 * Asaas Payment Creation
 * 
 * Creates a PIX payment in Asaas Sandbox.
 * Validates input and forwards to Asaas API.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const apiKey = Deno.env.get('ASAAS_API_KEY');
    if (!apiKey) {
      console.error('[Asaas] Missing ASAAS_API_KEY environment variable');
      return new Response('Server configuration error', { status: 500 });
    }

    const useAsaas = Deno.env.get('USE_ASAAS') === 'true';
    if (!useAsaas) {
      console.log('[Asaas] USE_ASAAS is disabled, returning mock response');
      const mockPayment = {
        id: 'mock_payment_' + Date.now(),
        status: 'PENDING',
        value: 10.00,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      return new Response(JSON.stringify(mockPayment), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body: AsaasPaymentRequest = await req.json();
    
    if (!body.customerId || !body.value || body.value <= 0) {
      return new Response(JSON.stringify({
        error: 'customerId e value são obrigatórios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set due date to tomorrow if not provided
    const dueDate = body.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('[Asaas] Creating PIX payment for customer:', body.customerId, 'value:', body.value);

    // Forward to Asaas API
    const asaasResponse = await fetch('https://api-sandbox.asaas.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        customer: body.customerId,
        billingType: 'PIX',
        value: body.value,
        description: body.description || 'Compra de bilhetes',
        dueDate: dueDate
      })
    });

    const responseData = await asaasResponse.json();

    if (!asaasResponse.ok) {
      console.error('[Asaas] Payment creation failed:', responseData);
      return new Response(JSON.stringify({
        error: responseData.errors?.[0]?.description || 'Erro ao criar pagamento'
      }), {
        status: asaasResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payment: AsaasPaymentResponse = {
      id: responseData.id,
      status: responseData.status,
      value: responseData.value,
      dueDate: responseData.dueDate
    };

    console.log('[Asaas] Payment created successfully:', payment.id, 'status:', payment.status);

    return new Response(JSON.stringify(payment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Asaas] Payment creation error:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

serve(withCORS(handler));