// supabase/functions/payments-webhook/index.ts
// deno run -A supabase/functions/payments-webhook/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

// --- helpers ---
async function readRaw(req: Request) {
  const ab = await req.arrayBuffer();
  return new Uint8Array(ab);
}
const td = new TextDecoder();

// TODO(Asaas): implement real HMAC verification using ASAAS_WEBHOOK_SECRET
function verifyAsaasSignature(_raw: Uint8Array, req: Request): boolean {
  const secret = Deno.env.get("ASAAS_WEBHOOK_SECRET");
  // If no secret configured, do not block the request
  if (!secret) return true;
  // Example to implement later:
  // const sig = req.headers.get("X-Asaas-Signature") ?? "";
  // compute HMAC(raw) with secret and timing-safe compare with sig
  return true; // placeholder - treat as valid when secret exists
}

// TODO(Stripe): verify "Stripe-Signature" header per Stripe docs using STRIPE_WEBHOOK_SECRET
function verifyStripeSignature(_raw: Uint8Array, req: Request): boolean {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  // If no secret configured, do not block the request
  if (!secret) return true;
  // Typically: use stripe sdk or manual verification of signed payload
  return true; // placeholder - treat as valid when secret exists
}

async function confirmAndLog(
  provider: "asaas" | "stripe",
  providerPaymentId: string,
  rawPayload: unknown
) {
  // 1) Find pending by provider ref to get reservation_id and subtotal-only amount
  const { data: pendingPayments, error: pendingLookupErr } = await supabase
    .from("payments_pending")
    .select("reservation_id, amount, ui_state, status")
    .eq("asaas_payment_id", providerPaymentId)
    .limit(1);

  if (pendingLookupErr) {
    console.error("Pending lookup error:", pendingLookupErr);
    throw pendingLookupErr;
  }

  if (!pendingPayments?.length || !pendingPayments[0]?.reservation_id) {
    console.error(`Missing reservation_id for provider_payment_id=${providerPaymentId}`);
    throw new Error("reservation_id_not_found");
  }

  const pending = pendingPayments[0];
  const reservationId = pending.reservation_id as string;
  const subtotalOnly = pending.amount; // tickets only
  const uiState = pending.ui_state || {};

  // 2) Idempotency: if an existing PAID tx exists for this reservation, no-op
  const paidSet = new Set(["paid", "approved", "confirmed", "settled"]);
  const { data: existingTxRows, error: existingErr } = await supabase
    .from("transactions")
    .select("id,status")
    .eq("reservation_id", reservationId)
    .limit(1);
  if (existingErr) {
    console.warn("Existing tx lookup failed:", existingErr);
  }
  let txId: string | null = null;
  if (existingTxRows && existingTxRows.length && paidSet.has((existingTxRows[0].status || '').toLowerCase())) {
    txId = existingTxRows[0].id;
    console.log(`Transaction already paid for reservation=${reservationId}, tx=${txId} → no-op`);
  } else {
    // 3) Upsert transaction with subtotal only (excludes institutional fee)
    const { data: upsertRows, error: txError } = await supabase
      .from("transactions")
      .upsert({
        reservation_id: reservationId,
        amount: subtotalOnly, // IMPORTANT: tickets only (used by money views)
        status: 'paid',
        provider: provider,
        provider_payment_id: providerPaymentId,
        raw_payload: {
          ...(rawPayload || {}),
          // Include fee info for audit
          institutional_fee: uiState.institutional_fee ?? 2.00,
          charge_total: uiState.charge_total,
          qty: uiState.qty,
          unit_price: uiState.unit_price,
          subtotal_only: subtotalOnly
        }
      }, {
        onConflict: 'reservation_id',
        ignoreDuplicates: false
      })
      .select("id,status")
      .limit(1);

    if (txError) {
      console.error("Failed to upsert transaction:", txError);
      throw txError;
    }
    txId = upsertRows?.[0]?.id ?? null;
  }

  // 4) Link tickets to this transaction (only where not linked) and mark as paid
  if (txId) {
    const { error: ticketError } = await supabase
      .from("tickets")
      .update({
        status: 'paid',
        transaction_id: txId,
        updated_at: new Date().toISOString()
      })
      .eq("reservation_id", reservationId)
      .is("transaction_id", null);

    if (ticketError) {
      console.warn("Failed to update tickets:", ticketError);
    }
  }

  // 5) Update payments_pending status → PAID
  const { error: pendingError } = await supabase
    .from("payments_pending")
    .update({
      status: 'PAID',
      updated_at: new Date().toISOString()
    })
    .eq("reservation_id", reservationId);

  if (pendingError) {
    console.warn("Failed to update payments_pending:", pendingError);
  }

  console.log(`Payment finalized: reservation=${reservationId}, subtotal=${subtotalOnly}, provider=${provider}`);
}

// Supabase Edge Functions must set CORS headers explicitly.
// Docs: supabase.com/docs/guides/functions#cors
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    const url = new URL(req.url);
    const path = url.pathname; // .../payments-webhook/asaas | .../stripe
    const raw = await readRaw(req);
    const text = td.decode(raw);

    // ASAAS
    if (path.endsWith("/asaas")) {
      // Always accept, parse JSON safely
      let payload: any = null;
      try { payload = JSON.parse(text || "{}"); } catch (_) { payload = null; }

      // Best-effort logging (service role bypasses RLS)
      try {
        const statusStr = String(payload?.event ?? payload?.payment?.status ?? payload?.status ?? "");
        await supabase.from("asaas_webhook_logs").insert({
          raw: payload ?? {},
          event: statusStr,
        });
      } catch (e) {
        console.warn("asaas_webhook_logs insert failed", e);
      }

      // Extract identifiers
      const providerPaymentId = payload?.payment?.id ?? payload?.id ?? payload?.invoiceNumber ?? "";
      const status = String(payload?.event ?? payload?.payment?.status ?? payload?.status ?? "").toUpperCase();

      // Mark paid quickly (no heavy processing here)
      const paidLike = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
      if (providerPaymentId && paidLike.has(status)) {
        try {
          await supabase
            .from("payments_pending")
            .update({ status: "PAID", updated_at: new Date().toISOString() })
            .eq("asaas_payment_id", providerPaymentId);
        } catch (e) {
          console.warn("payments_pending update failed", e);
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // STRIPE
    if (path.endsWith("/stripe")) {
      if (!verifyStripeSignature(raw, req)) {
        return new Response("Invalid Stripe signature", { status: 400, headers: corsHeaders });
      }
      const event = JSON.parse(text || "{}");
      let providerPaymentId = "";

      switch (event?.type) {
        case "checkout.session.completed":
          providerPaymentId =
            event?.data?.object?.payment_intent ?? event?.data?.object?.id ?? "";
          break;
        case "payment_intent.succeeded":
          providerPaymentId = event?.data?.object?.id ?? "";
          break;
        default:
          // Ignore other event types
          return new Response("Ignored", { status: 200 });
      }

      if (providerPaymentId) {
        await confirmAndLog("stripe", providerPaymentId, event);
      }
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    // Never fail the webhook: respond 200 to avoid provider pausing deliveries
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});