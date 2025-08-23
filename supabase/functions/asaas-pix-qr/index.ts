import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";

interface AsaasPixQrResponse {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

/**
 * Asaas PIX QR Code Generation
 * 
 * Fetches PIX QR code and payload for a payment from Asaas Sandbox.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
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
      console.log('[Asaas] USE_ASAAS is disabled, returning mock QR');
      const mockQr = {
        encodedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        payload: '00020126330014BR.GOV.BCB.PIX0111123456789015204000053039865802BR5913MOCK PAYMENT6008SAOPAULO62140510mock123456304ABCD',
        expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };
      return new Response(JSON.stringify(mockQr), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Extract payment ID from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const paymentId = pathParts[pathParts.length - 2]; // .../payments/{id}/pix

    if (!paymentId) {
      return new Response(JSON.stringify({
        error: 'Payment ID é obrigatório'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Asaas] Fetching PIX QR for payment:', paymentId);

    // Forward to Asaas API
    const asaasResponse = await fetch(`https://api-sandbox.asaas.com/v3/payments/${paymentId}/pixQrCode`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const responseData = await asaasResponse.json();

    if (!asaasResponse.ok) {
      console.error('[Asaas] PIX QR fetch failed:', responseData);
      return new Response(JSON.stringify({
        error: responseData.errors?.[0]?.description || 'Erro ao buscar QR Code'
      }), {
        status: asaasResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const pixQr: AsaasPixQrResponse = {
      encodedImage: responseData.encodedImage,
      payload: responseData.payload,
      expirationDate: responseData.expirationDate
    };

    console.log('[Asaas] PIX QR fetched successfully for payment:', paymentId);

    return new Response(JSON.stringify(pixQr), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Asaas] PIX QR fetch error:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

serve(withCORS(handler));