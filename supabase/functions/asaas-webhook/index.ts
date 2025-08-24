import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { withCORS } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE);

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
    externalReference?: string;
  };
}

function normToken(raw: string) {
  if (!raw) return "";
  const v = raw.trim().replace(/\r?\n/g, "");
  if (/^bearer\s+/i.test(v)) return v.replace(/^bearer\s+/i, "");
  if (/^token\s+/i.test(v))  return v.replace(/^token\s+/i, "");
  if (/^basic\s+/i.test(v)) {
    try {
      const dec = atob(v.replace(/^basic\s+/i, ""));
      const parts = dec.split(":", 2);
      if (parts.length === 2) return parts[1].trim();
    } catch {}
  }
  return v;
}

function extractToken(req: Request) {
  const h = req.headers;
  const candidates = [
    "x-asaas-token",
    "x-webhook-secret",
    "x-hook-token",
    "x-hook-secret",
    "access-token",
    "access_token",
    "asaas-token",
    "asaas_access_token",
    "authorization",
  ];
  for (const name of candidates) {
    const v = h.get(name);
    if (v) return { token: normToken(v), source: `header:${name}` };
  }

  for (const [name, value] of h.entries()) {
    if (name.includes("token") && value) {
      return { token: normToken(value), source: `header:${name}` };
    }
  }

  const u = new URL(req.url);
  const qpNames = ["token", "access_token", "access-token", "asaas_token"];
  for (const qn of qpNames) {
    const v = u.searchParams.get(qn);
    if (v) return { token: normToken(v), source: `query:${qn}` };
  }

  return { token: "", source: "none" };
}

/**
 * Asaas Webhook Handler (Sandbox)
 * 
 * Handles main payment events from Asaas and updates database status.
 * Uses mark_tickets_paid RPC when externalReference (reservation_id) is available,
 * otherwise falls back to confirm_payment RPC.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('ASAAS_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('[AsaasWebhook] Missing ASAAS_WEBHOOK_SECRET environment variable');
      return new Response('Server configuration error', { status: 500 });
    }

    // Validate secret token from headers and query
    const { token, source } = extractToken(req);

    if (!token || token !== webhookSecret) {
      const names = Array.from(req.headers.keys());
      console.warn(`[AsaasWebhook] 401: src=${source}, headers=${JSON.stringify(names)}`);
      return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
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

    // Handle main payment events - specifically PAYMENT_CONFIRMED
    if (MAIN_PAYMENT_EVENTS.includes(event as any)) {
      if (payment?.id) {
        console.log(`[AsaasWebhook] ${event} id=${payment.id} status=${payment.status}`);
        
        // Only process confirmed payments
        if (event === 'PAYMENT_CONFIRMED') {
          const providerPaymentId = payment.id;
          const reservationId = payment.externalReference;

          try {
            if (reservationId) {
              const { error } = await sb.rpc("mark_tickets_paid", {
                p_reservation_id: reservationId,
                p_provider: "asaas",
                p_provider_payment_id: providerPaymentId,
              });
              if (error) console.error("[asaas-webhook] mark_tickets_paid error:", error);
            } else {
              const { error } = await sb.rpc("confirm_payment", {
                p_provider: "asaas",
                p_provider_payment_id: providerPaymentId,
              });
              if (error) console.error("[asaas-webhook] confirm_payment error:", error);
            }
          } catch (e) {
            console.error("[asaas-webhook] rpc exception:", e);
          }
        }
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