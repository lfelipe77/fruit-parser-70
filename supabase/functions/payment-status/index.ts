import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ganhavel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId") ?? undefined;
    const reservationIdParam = url.searchParams.get("reservationId") ?? undefined;

    if (!paymentId && !reservationIdParam) {
      return new Response(JSON.stringify({ error: "Missing paymentId or reservationId" }), { status: 400, headers: corsHeaders });
    }

    // Auth (user JWT required)
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization Bearer token" }), { status: 401, headers: corsHeaders });
    }
    const jwt = auth.slice(7);

    // User client (RLS enforced)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401, headers: corsHeaders });
    }

    // --- Resolve reservation/payment rows with ownership via RLS ---
    let pending: any = null;
    let reservationId = reservationIdParam ?? undefined;

    if (reservationId) {
      const { data } = await userClient
        .from("payments_pending")
        .select("reservation_id, asaas_payment_id, status, expires_at, amount")
        .eq("reservation_id", reservationId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      pending = data || null;
    } else if (paymentId) {
      const { data } = await userClient
        .from("payments_pending")
        .select("reservation_id, asaas_payment_id, status, expires_at, amount")
        .eq("asaas_payment_id", paymentId)
        .maybeSingle();
      pending = data || null;
      reservationId = pending?.reservation_id;
    }

    if (!reservationId) {
      return new Response(JSON.stringify({ status: "UNKNOWN", reservationId: null, paymentId: paymentId ?? null }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // --- Already verified? ---
    const { data: verified } = await userClient
      .from("payments_verified")
      .select("reservation_id, asaas_payment_id, amount, paid_at")
      .eq("reservation_id", reservationId)
      .order("paid_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verified) {
      return new Response(
        JSON.stringify({ status: "PAID", reservationId, paymentId: verified.asaas_payment_id }),
        { status: 200, headers: corsHeaders },
      );
    }

    // --- Live check at Asaas if we have a payment id ---
    if (pending?.asaas_payment_id) {
      const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY") || "";
      const ASAAS_BASE = Deno.env.get("ASAAS_BASE") ?? "https://api.asaas.com/v3";
      if (ASAAS_API_KEY) {
        const h = new Headers();
        h.set("access_token", ASAAS_API_KEY);

        const resp = await fetch(`${ASAAS_BASE}/payments/${pending.asaas_payment_id}`, { headers: h });
        const txt = await resp.text();
        let j: any = null; try { j = txt ? JSON.parse(txt) : null; } catch {}
        const paid = resp.ok && j && (j.status === "RECEIVED" || j.status === "CONFIRMED");

        if (paid) {
          // Call finalize function to convert reservation to paid transaction
          try {
            const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
            const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            
            await adminClient.functions.invoke('payment-finalize', {
              body: {
                reservationId,
                asaasPaymentId: pending.asaas_payment_id,
                customerName: null,
                customerPhone: null,
                customerCpf: null
              }
            });
            console.log(`[payment-status] Finalization triggered for reservation ${reservationId}`);
          } catch (finalizeError) {
            console.error('[payment-status] Finalization error:', finalizeError);
            // Continue anyway - user will see PAID status
          }
          
          return new Response(
            JSON.stringify({ status: "PAID", reservationId, paymentId: pending.asaas_payment_id }),
            { status: 200, headers: corsHeaders },
          );
        }

        return new Response(
          JSON.stringify({
            status: "PENDING",
            reservationId,
            paymentId: pending.asaas_payment_id,
            asaasStatus: j?.status ?? "UNKNOWN",
          }),
          { status: 200, headers: corsHeaders },
        );
      }
    }

    // --- Default: unknown/pending ---
    return new Response(
      JSON.stringify({ status: "UNKNOWN", reservationId, paymentId: pending?.asaas_payment_id ?? null }),
      { status: 200, headers: corsHeaders },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});