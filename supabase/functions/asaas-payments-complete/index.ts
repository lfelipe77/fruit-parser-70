import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";

interface CompletePaymentRequest {
  reservation_id: string;
  amount: number;
  customer: {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
  };
  billingType: 'PIX';
}

interface CompletePaymentResponse {
  payment_id: string;
  qr: {
    encodedImage: string;
    payload: string;
    expiresAt: string;
  };
  value: number;
}

/**
 * Complete Payment Creation with Customer and QR Code
 * 
 * Creates customer, payment, and returns PIX QR code in one call.
 * Expected by the new checkout flow.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const apiKey = Deno.env.get('ASAAS_API_KEY');
    if (!apiKey) {
      console.error('[AsaasComplete] Missing ASAAS_API_KEY environment variable');
      return new Response(JSON.stringify({
        error: 'Configuração do servidor'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const useMock = !apiKey || Deno.env.get('USE_ASAAS') === 'false';
    if (useMock) {
      console.log('[AsaasComplete] Using mock mode, returning mock response');
      const mockResponse: CompletePaymentResponse = {
        payment_id: 'mock_payment_' + Date.now(),
        qr: {
          encodedImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          payload: '00020101021226620014br.gov.bcb.pix2540example.com/qr/v2/mock-qr-code-12345678901234567890123456789012345254040000520400005303986540510.005802BR5913Mock Merchant6008BRASILIA62070503***63045678',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        },
        value: 25.00
      };
      return new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse and validate request body
    const body: CompletePaymentRequest = await req.json();
    
    if (!body.reservation_id || !body.amount || body.amount <= 0 || !body.customer?.name || !body.customer?.email) {
      return new Response(JSON.stringify({
        error: 'reservation_id, amount, customer.name e customer.email são obrigatórios'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AsaasComplete] Creating complete payment flow for reservation:', body.reservation_id);

    // Step 1: Create customer
    const customerResponse = await fetch('https://api-sandbox.asaas.com/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        name: body.customer.name.trim(),
        email: body.customer.email.trim(),
        cpfCnpj: body.customer.cpf?.trim(),
        mobilePhone: body.customer.phone?.trim()
      })
    });

    const customerData = await customerResponse.json();

    if (!customerResponse.ok) {
      console.error('[AsaasComplete] Customer creation failed:', customerData);
      return new Response(JSON.stringify({
        error: customerData.errors?.[0]?.description || 'Erro ao criar cliente'
      }), {
        status: customerResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AsaasComplete] Customer created:', customerData.id);

    // Step 2: Create PIX payment
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const paymentResponse = await fetch('https://api-sandbox.asaas.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        customer: customerData.id,
        billingType: 'PIX',
        value: body.amount,
        description: `Compra de bilhetes - Reserva ${body.reservation_id}`,
        externalReference: body.reservation_id,
        dueDate: dueDate
      })
    });

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('[AsaasComplete] Payment creation failed:', paymentData);
      return new Response(JSON.stringify({
        error: paymentData.errors?.[0]?.description || 'Erro ao criar pagamento'
      }), {
        status: paymentResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AsaasComplete] Payment created:', paymentData.id);

    // Step 3: Get PIX QR code
    const qrResponse = await fetch(`https://api-sandbox.asaas.com/v3/payments/${paymentData.id}/pixQrCode`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const qrData = await qrResponse.json();

    if (!qrResponse.ok) {
      console.error('[AsaasComplete] QR code generation failed:', qrData);
      return new Response(JSON.stringify({
        error: qrData.errors?.[0]?.description || 'Erro ao gerar QR code'
      }), {
        status: qrResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[AsaasComplete] QR code generated successfully');

    // Build complete response with normalized image encoding
    const encodedImageBase64 = qrData.encodedImage ?? qrData.image ?? '';
    const encodedImage = encodedImageBase64.startsWith('data:')
      ? encodedImageBase64
      : `data:image/png;base64,${encodedImageBase64}`;

    const response: CompletePaymentResponse = {
      payment_id: paymentData.id,
      qr: {
        encodedImage,               // <- already prefixed!
        payload: qrData.payload,
        expiresAt: qrData.expiresAt ?? qrData.expirationDate ?? new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      value: body.amount
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[AsaasComplete] Complete payment error:', error);
    return new Response(JSON.stringify({
      error: 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

serve(withCORS(handler));