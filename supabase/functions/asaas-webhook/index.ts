import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";

const MAIN_PAYMENT_EVENTS = [
  'PAYMENT_CREATED',
  'PAYMENT_RECEIVED', 
  'PAYMENT_CONFIRMED',
  'PAYMENT_OVERDUE',
  'PAYMENT_REFUNDED'
] as const;

interface AsaasWebhookPayload {
  event: string;
  payment?: {
    id: string;
    status: string;
  };
}

/**
 * Asaas Webhook Handler (Sandbox)
 * 
 * Handles main payment events from Asaas:
 * - PAYMENT_CREATED, PAYMENT_RECEIVED, PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED
 * 
 * Validates webhook secret and logs relevant events.
 * No database writes in this implementation.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('ASAAS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[AsaasWebhook] Missing ASAAS_WEBHOOK_SECRET environment variable');
      return new Response('Server configuration error', { status: 500 });
    }

    // Validate secret token from headers
    const providedSecret = 
      req.headers.get('x-webhook-secret') ||
      req.headers.get('x-asaas-token') ||
      (req.headers.get('authorization')?.replace(/^Bearer\s+/i, ''));

    if (!providedSecret || providedSecret !== webhookSecret) {
      console.warn('[AsaasWebhook] Invalid or missing webhook secret');
      return new Response('Unauthorized', { status: 401 });
    }

    // Parse request body (limit size to ~200KB)
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > 200 * 1024) {
      return new Response('Payload too large', { status: 413 });
    }

    const body = await req.text();
    if (!body.trim()) {
      return new Response('Empty body', { status: 400 });
    }

    let payload: AsaasWebhookPayload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('[AsaasWebhook] Invalid JSON payload:', error);
      return new Response('Invalid JSON', { status: 400 });
    }

    const { event, payment } = payload;

    if (!event) {
      return new Response('Missing event field', { status: 400 });
    }

    // Handle main payment events
    if (MAIN_PAYMENT_EVENTS.includes(event as any)) {
      if (payment?.id && payment?.status) {
        console.log(`[AsaasWebhook] ${event} id=${payment.id} status=${payment.status}`);
      } else {
        console.log(`[AsaasWebhook] ${event} (payment data incomplete)`);
      }
    } else {
      console.debug(`[AsaasWebhook] ignored event ${event}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[AsaasWebhook] Unexpected error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

serve(withCORS(handler));