// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const ASAAS_API = "https://api.asaas.com/v3";

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  const MAINT = Deno.env.get("MAINTENANCE") === "true";
  if (MAINT) return json(503, { ok: false, code: "MAINTENANCE" });

  let body: any;
  try { body = await req.json(); } catch { return json(400, { error: "Invalid JSON body" }); }

  const { provider, method, raffle_id, qty, amount, currency, reservation_id, debug, dryRun } = body ?? {};
  
  // DEBUG: env presence (no secret values leaked)
  if (debug === true) {
    const has = (k: string) => Boolean(Deno.env.get(k));
    return new Response(JSON.stringify({
      ok: true,
      debug: {
        has_ASAAS_API_KEY: has("ASAAS_API_KEY"),
        has_ASAAS_DEFAULT_CUSTOMER_ID: has("ASAAS_DEFAULT_CUSTOMER_ID"),
        has_SB_URL: has("SB_URL"),
        has_SB_SERVICE_ROLE_KEY: has("SB_SERVICE_ROLE_KEY"),
        maintenance: Deno.env.get("MAINTENANCE") === "true",
      }
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }});
  }
  if (!provider || !raffle_id || !qty || typeof amount !== "number" || !currency) {
    return json(400, { error: "Missing fields", required: ["provider", "raffle_id", "qty", "amount:number", "currency"] });
  }

  const fee_fixed = 2.0;
  const subtotal = amount;                 // tickets-only
  const charge_total = subtotal + fee_fixed;
  if (subtotal < 3.0 || charge_total < 5.0) {
    return json(400, {
      error: "Minimum charge requirement not met",
      minimum_subtotal: 3.0,
      minimum_charge_total: 5.0,
      received_subtotal: subtotal,
      received_charge_total: charge_total,
    });
  }

  const SB_URL = Deno.env.get("SB_URL");
  const SB_SERVICE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");
  const sb = (SB_URL && SB_SERVICE_KEY)
    ? createClient(SB_URL, SB_SERVICE_KEY, { auth: { persistSession: false } })
    : null;

  try {
    let provider_payment_id: string | null = null;
    let redirect_url: string | null = null;
    let pix_qr_code: string | undefined;
    let pix_copy_paste: string | undefined;

    if (provider === "asaas" && (method ?? "pix") === "pix") {
      const API_KEY = Deno.env.get("ASAAS_API_KEY");
      if (!API_KEY) return json(500, { error: "Missing ASAAS_API_KEY" });

      const customerId = "cus_000132351463"; // Static customer per business requirement
      if (!/^cus_/.test(customerId)) {
        console.error("[create-checkout] INVALID customerId:", customerId);
        return json(500, { error: "Invalid Asaas customer id. Expected 'cus_...'", using: customerId });
      }
      console.log("[create-checkout] using_customer:", customerId);

      if (!reservation_id) return json(400, { error: "Missing reservation_id (use your purchase_id)" });
      // DRY RUN: show payload without calling Asaas
      if (dryRun === true) {
        const subtotal = Number(amount ?? 0);
        const value = Number(charge_total.toFixed(2));
        const dueDate = new Date().toISOString().slice(0,10);

        const asaasPayload = {
          customer: customerId,
          billingType: "PIX",
          value,
          dueDate,
          externalReference: reservation_id ?? null,
          description: "Ganhavel - Compra de bilhetes",
        };

        return new Response(JSON.stringify({ ok: true, dryRun: true, request: asaasPayload }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      // Reuse if already created for this reservation
      if (sb) {
        const { data: existing, error: exErr } = await sb
          .from("payments_pending")
          .select("reservation_id, asaas_payment_id")
          .eq("reservation_id", reservation_id)
          .maybeSingle();
        if (!exErr && existing?.asaas_payment_id) provider_payment_id = existing.asaas_payment_id;
      }

      if (!provider_payment_id) {
        const value = Number(charge_total.toFixed(2));
        const dueDate = new Date().toISOString().slice(0,10);
        const asaasPayload = {
          customer: customerId,
          billingType: "PIX",
          value,
          dueDate,
          externalReference: reservation_id,
          description: "Ganhavel - Compra de bilhetes",
        };

        const TRACE_ID = crypto.randomUUID();
        console.log("[asaas] TRACE", TRACE_ID, "payload", asaasPayload);

        const res = await fetch(`${ASAAS_API}/payments`, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            access_token: API_KEY,
            "X-Debug-Trace-Id": TRACE_ID,
            "User-Agent": "Ganhavel/1.0 (create-checkout)",
          },
          body: JSON.stringify(asaasPayload),
        });

        const raw = await res.text();
        if (!res.ok) {
          let details; try { details = JSON.parse(raw); } catch { details = { raw }; }
          console.error("[asaas] TRACE", TRACE_ID, "error", { status: res.status, details });

          return json(502, {
            error: "Asaas create payment failed",
            status: res.status,
            trace_id: TRACE_ID,
            request: asaasPayload,
            details
          });
        }
        const created = JSON.parse(raw);
        provider_payment_id = created?.id ?? null;
        if (!provider_payment_id) return json(502, { error: "Asaas returned no payment id", raw: created });

        // Fetch PIX QR code data for embedded payment - ALWAYS try to get PIX data
      }

      // Always fetch PIX QR data after payment creation

      if (provider_payment_id) {
        const qrRes = await fetch(`${ASAAS_API}/payments/${provider_payment_id}/pixQrCode`, {
          method: "GET",
          headers: { accept: "application/json", access_token: API_KEY }
        });

        const qr = await qrRes.json().catch(() => null);
        if (qrRes.ok && qr) {
          // Debug: Log the exact structure returned by Asaas
          console.log("[asaas] PIX QR response structure:", JSON.stringify(qr, null, 2));
          
          // Use payload string for QR code (not encodedImage)
          const pixString = qr?.payload || "";
          pix_qr_code = pixString;
          pix_copy_paste = pixString;
          
          console.log("[asaas] PIX data extracted:", { 
            pix_qr_code: pix_qr_code ? "present" : "missing", 
            pix_copy_paste: pix_copy_paste ? "present" : "missing",
            payment_id: provider_payment_id 
          });
        } else {
          console.warn("[asaas] no pix qr data for", provider_payment_id, { status: qrRes.status, qr });
        }
      }

      // Persist minimal snapshot + link (no transactions writes)
      if (sb && isUuid(reservation_id)) {
        // Set expires_at to 30 minutes from now
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        
        const pendingUpsert = {
          reservation_id,
          asaas_payment_id: provider_payment_id,
          amount: subtotal,
          status: "PENDING",
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        };
        const { error: upErr } = await sb.from("payments_pending")
          .upsert(pendingUpsert, { onConflict: "reservation_id" });
        if (upErr) console.warn("[create-checkout] payments_pending upsert error:", upErr);

        // Skip purchase_payments upsert as it has FK constraint issues
        // Focus on payments_pending which is the main tracking table
        console.log("[create-checkout] Skipping purchase_payments upsert to avoid FK constraint violation");
      } else if (!isUuid(reservation_id)) {
        console.warn("[create-checkout] Skipping DB upserts: reservation_id is not a UUID");
      } else {
        console.warn("[create-checkout] Service client unavailable; DB upserts skipped");
      }
    } else {
      // mock branch for other providers
      provider_payment_id = `${provider}_${crypto.randomUUID()}`;
      redirect_url = `https://example.com/checkout/${provider_payment_id}`;
    }

    console.log(`Checkout for ${provider}: raffle=${raffle_id}, qty=${qty}, subtotal=${subtotal.toFixed(2)}, fee=${fee_fixed.toFixed(2)}, total=${charge_total.toFixed(2)}, reservation=${reservation_id || "none"}`);

    return json(200, {
      ok: true,
      provider,
      method: method ?? "pix",
      provider_payment_id,
      redirect_url,
      reservation_id,
      fee_fixed,
      fee_pct: 0,
      fee_amount: 0,
      amount: subtotal,
      charge_total,
      total_amount: charge_total,
      raffle_id,
      qty,
      currency,
      // PIX-specific data for embedded payment
      pix_qr_code,
      pix_copy_paste,
    });
  } catch (e) {
    console.error("Create checkout error:", e);
    return json(500, { error: "Internal Error", details: `${e?.message ?? e}` });
  }
});

function safeParse(txt: string) { try { return JSON.parse(txt); } catch { return { raw: txt }; } }
