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

    if (provider === "asaas" && (method ?? "pix") === "pix") {
      const API_KEY = Deno.env.get("ASAAS_API_KEY");
      const CUSTOMER_ID = Deno.env.get("ASAAS_DEFAULT_CUSTOMER_ID");
      if (!API_KEY || !CUSTOMER_ID) return json(500, { error: "Asaas env vars not set (ASAAS_API_KEY / ASAAS_DEFAULT_CUSTOMER_ID)" });
      if (!reservation_id) return json(400, { error: "Missing reservation_id (use your purchase_id)" });

      // DRY RUN: show payload without calling Asaas
      if (dryRun === true) {
        const subtotal = Number(amount ?? 0);
        const value = Number(subtotal.toFixed(2));
        const dueDate = new Date().toISOString().slice(0,10);

        const asaasPayload = {
          customer: CUSTOMER_ID ?? null,
          billingType: "PIX",
          value,
          dueDate,
          externalReference: reservation_id ?? null,
          description: "Ganhavel - Compra de rifa",
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
        const value = Number(subtotal.toFixed(2));
        const dueDate = new Date().toISOString().slice(0,10);
        const asaasPayload = {
          customer: CUSTOMER_ID,
          billingType: "PIX",
          value,
          dueDate,
          externalReference: reservation_id,
          description: "Ganhavel - Compra de rifa",
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
        redirect_url = created?.invoiceUrl ?? null;
        if (!provider_payment_id) return json(502, { error: "Asaas returned no payment id", raw: created });
      }

      // Persist minimal snapshot + link (no transactions writes)
      if (sb && isUuid(reservation_id)) {
        const pendingUpsert = {
          reservation_id,
          asaas_payment_id: provider_payment_id,
          amount: subtotal,
          status: "PENDING",
          updated_at: new Date().toISOString(),
        };
        const { error: upErr } = await sb.from("payments_pending")
          .upsert(pendingUpsert, { onConflict: "reservation_id" });
        if (upErr) console.warn("[create-checkout] payments_pending upsert error:", upErr);

        const linkUpsert = {
          purchase_id: reservation_id,
          asaas_payment_id: provider_payment_id,
          status: "pending",
          updated_at: new Date().toISOString(),
        };
        const { error: linkErr } = await sb.from("purchase_payments")
          .upsert(linkUpsert, { onConflict: "purchase_id" });
        if (linkErr) console.warn("[create-checkout] purchase_payments upsert error:", linkErr);
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
    });
  } catch (e) {
    console.error("Create checkout error:", e);
    return json(500, { error: "Internal Error", details: `${e?.message ?? e}` });
  }
});

function safeParse(txt: string) { try { return JSON.parse(txt); } catch { return { raw: txt }; } }
