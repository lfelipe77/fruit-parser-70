import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";

interface AsaasCustomerRequest {
  name: string;
  email?: string;
  cpfCnpj?: string;
  mobilePhone?: string;
}

interface AsaasCustomerResponse {
  id: string;
  name: string;
  email?: string;
  cpfCnpj?: string;
}

/**
 * Asaas Customer Creation
 * 
 * Creates a customer in Asaas Sandbox for PIX payments.
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
      return new Response(JSON.stringify({
        id: 'mock_customer_' + Date.now(),
        name: 'Mock Customer',
        email: 'mock@example.com'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body: AsaasCustomerRequest = await req.json();
    
    if (!body.name || body.name.trim().length < 2) {
      return new Response(JSON.stringify({
        error: 'Nome é obrigatório e deve ter pelo menos 2 caracteres'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Asaas] Creating customer for:', body.name);

    // Forward to Asaas API
    const asaasResponse = await fetch('https://api-sandbox.asaas.com/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email?.trim(),
        cpfCnpj: body.cpfCnpj?.trim(),
        mobilePhone: body.mobilePhone?.trim()
      })
    });

    const responseData = await asaasResponse.json();

    if (!asaasResponse.ok) {
      console.error('[Asaas] Customer creation failed:', responseData);
      return new Response(JSON.stringify({
        error: responseData.errors?.[0]?.description || 'Erro ao criar cliente'
      }), {
        status: asaasResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const customer: AsaasCustomerResponse = {
      id: responseData.id,
      name: responseData.name,
      email: responseData.email,
      cpfCnpj: responseData.cpfCnpj
    };

    console.log('[Asaas] Customer created successfully:', customer.id);

    return new Response(JSON.stringify(customer), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Asaas] Customer creation error:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

serve(withCORS(handler));