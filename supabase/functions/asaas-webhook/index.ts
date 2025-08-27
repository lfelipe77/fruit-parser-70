// supabase/functions/asaas-webhook/index.ts
// Validates Asaas token, parses payload, and (only here) flips tickets to paid.

import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.53.0?target=deno";

function json(body: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function safeEqual(a?: string | null, b?: string | null) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
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
  for (const qn of ["token", "access_token", "access-token", "asaas_token"]) {
    const v = u.searchParams.get(qn);
    if (v) return { token: normToken(v), source: `query:${qn}` };
  }
  return { token: "", source: "none" };
}

const OK_EVENTS = new Set([
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",  // sometimes used by sandbox
]);

export default {
  async fetch(req: Request): Promise<Response> {
    if (req.method !== "POST") {
      return json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
    }

    // 1) Auth: validate webhook secret
    const secret =
      (typeof Deno !== "undefined" ? Deno.env.get("ASAAS_WEBHOOK_SECRET") : undefined) ||
      (globalThis as any).ASAAS_WEBHOOK_SECRET ||
      (typeof process !== "undefined" ? (process as any).env?.ASAAS_WEBHOOK_SECRET : undefined);

    const { token, source } = extractToken(req);
    if (!secret || !safeEqual(token, secret)) {
      const names = Array.from(req.headers.keys());
      console.warn(`[AsaasWebhook] 401: src=${source}, headers=${JSON.stringify(names)}`);
      return json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2) Parse payload
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const event = payload?.event;
    const payment = payload?.payment || {};
    const providerPaymentId = payment?.id ?? null;
    const reservationId = payment?.externalReference ?? null; // our glue UUID
    const amount = Number(payment?.value ?? 0);

    if (!OK_EVENTS.has(event)) {
      return json({ ok: true, ignored: true, reason: `event ${event}` });
    }
    if (!providerPaymentId) {
      return json({ ok: false, error: "Missing payment.id" }, { status: 400 });
    }

    // 3) Service-role Supabase client
    const SUPABASE_URL =
      (typeof Deno !== "undefined" ? Deno.env.get("SUPABASE_URL") : undefined) ||
      (typeof process !== "undefined" ? (process as any).env?.SUPABASE_URL : undefined);
    const SERVICE_ROLE =
      (typeof Deno !== "undefined" ? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") : undefined) ||
      (typeof process !== "undefined" ? (process as any).env?.SUPABASE_SERVICE_ROLE_KEY : undefined);

    const sb = createClient(SUPABASE_URL!, SERVICE_ROLE!, { auth: { persistSession: false } });

    // 4) Only here do we write to DB: mark tickets paid (idempotent)
    try {
      if (reservationId) {
        const { error } = await sb.rpc("mark_tickets_paid", {
          p_reservation_id: reservationId,
          p_provider: "asaas",
          p_provider_payment_id: providerPaymentId,
        });
        if (error) {
          console.error("[asaas-webhook] mark_tickets_paid error:", error);
          // Still return 200 so Asaas doesn’t spam retries; we logged it.
          return json({ ok: true, warn: "mark_tickets_paid_error", detail: String((error as any)?.message || error) });
        }
      } else {
        // Legacy fallback (not ideal; try to always pass externalReference)
        const { error } = await sb.rpc("confirm_payment", {
          p_provider: "asaas",
          p_provider_payment_id: providerPaymentId,
        });
        if (error) {
          console.error("[asaas-webhook] confirm_payment error:", error);
          return json({ ok: true, warn: "confirm_payment_error", detail: String((error as any)?.message || error) });
        }
      }
    } catch (e: any) {
      console.error("[asaas-webhook] rpc exception:", e);
      return json({ ok: true, warn: "rpc_exception", detail: String(e?.message || e) });
    }

    return json({ ok: true, event, providerPaymentId, reservationId, amount });
  },
};
