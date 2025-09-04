import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

// ENV
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Service client with elevated permissions
const sbService = createClient(SUPABASE_URL, SERVICE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    console.log("[finalize-payment] Starting finalization process");

    // 1) Authenticate user with incoming JWT
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    
    const { data: userRes, error: authError } = await authClient.auth.getUser();
    const user = userRes?.user;
    
    if (authError || !user) {
      console.error("[finalize-payment] Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ ok: false, reason: "unauthorized" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 401 
      });
    }

    console.log(`[finalize-payment] User authenticated: ${user.id}`);

    // 2) Parse request body
    const body = await req.json();
    const { reservationId, asaasPaymentId, customerName, customerPhone, customerCpf } = body;
    
    if (!reservationId || !asaasPaymentId) {
      console.error("[finalize-payment] Missing required fields:", { reservationId, asaasPaymentId });
      return new Response(JSON.stringify({ ok: false, reason: "bad_request" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      });
    }

    console.log(`[finalize-payment] Processing reservation: ${reservationId}, payment: ${asaasPaymentId}`);

    // 3) Verify payment is PAID
    const { data: paymentRow, error: payErr } = await sbService
      .from("payments_pending")
      .select("status, amount, reservation_id")
      .eq("asaas_payment_id", asaasPaymentId)
      .maybeSingle();

    if (payErr) {
      console.error("[finalize-payment] Payment query error:", payErr);
      return new Response(JSON.stringify({ ok: false, reason: "payment_error" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 500 
      });
    }

    if (!paymentRow || paymentRow.status !== "PAID") {
      console.error("[finalize-payment] Payment not paid:", { status: paymentRow?.status });
      return new Response(JSON.stringify({ ok: false, reason: "not_paid", status: paymentRow?.status }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      });
    }

    // Verify reservation matches payment
    if (paymentRow.reservation_id !== reservationId) {
      console.error("[finalize-payment] Reservation ID mismatch:", { 
        paymentReservation: paymentRow.reservation_id, 
        requestReservation: reservationId 
      });
      return new Response(JSON.stringify({ ok: false, reason: "reservation_mismatch" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      });
    }

    console.log(`[finalize-payment] Payment verified as PAID: ${paymentRow.amount}`);

    // 4) Idempotency guard via payments_applied
    const { data: applied, error: appliedErr } = await sbService
      .from("payments_applied")
      .select("payment_id")
      .eq("payment_id", asaasPaymentId)
      .maybeSingle();

    if (appliedErr) {
      console.warn("[finalize-payment] payments_applied read failed:", appliedErr);
      try {
        await sbService.from("finalize_logs").insert({
          reservation_id: reservationId,
          payment_id: asaasPaymentId,
          step: "guard_check",
          ok: false,
          message: "payments_applied read failed",
          meta: { error: String(appliedErr) }
        });
      } catch {}
      return new Response(JSON.stringify({ ok: false, reason: "guard_failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (applied) {
      console.log(`[finalize-payment] Already finalized by payments_applied guard for reservation ${reservationId}`);
      return new Response(JSON.stringify({ ok: true, already_finalized: true, reservation_id: reservationId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 5) Mint tickets if none exist yet (post-payment flow) and finalize
    // 5a) Load purchase to validate ownership and get raffle/qty/price
    const { data: reservation, error: reservationErr } = await sbService
      .from("reservations")
      .select("id, user_id, raffle_id, quantity, unit_price")
      .eq("id", reservationId)
      .maybeSingle();

    if (reservationErr || !reservation) {
      console.error("[finalize-payment] Reservation not found:", reservationErr);
      return new Response(JSON.stringify({ ok: false, reason: "reservation_not_found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (reservation.user_id !== user.id) {
      console.error("[finalize-payment] Reservation not owned by user", { user: user.id, owner: reservation.user_id });
      return new Response(JSON.stringify({ ok: false, reason: "reservation_not_owned" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // 5b) Check if any tickets exist for this reservation
    const { count: existingCount, error: countErr } = await sbService
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .eq("reservation_id", reservationId);

    if (countErr) {
      console.warn("[finalize-payment] Ticket count failed:", countErr);
      try {
        await sbService.from("finalize_logs").insert({
          reservation_id: reservationId,
          payment_id: asaasPaymentId,
          step: "tickets_count",
          ok: false,
          message: "count failed",
          meta: { error: String(countErr) }
        });
      } catch {}
    }

    if (!existingCount || existingCount === 0) {
      const qty = Number(reservation.quantity || 0);
      if (qty <= 0) {
        console.error("[finalize-payment] Invalid quantity on reservation", { qty });
        return new Response(JSON.stringify({ ok: false, reason: "invalid_quantity" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      const payload = Array.from({ length: qty }).map(() => ({
        raffle_id: reservation.raffle_id,
        reservation_id: reservationId,
        user_id: reservation.user_id,
        status: "paid" as const,
        unit_price: reservation.unit_price,
      }));

      const { error: insertErr } = await sbService.from("tickets").insert(payload);
      if (insertErr) {
        console.error("[finalize-payment] Ticket mint failed:", insertErr);
        try {
          await sbService.from("finalize_logs").insert({
            reservation_id: reservationId,
            payment_id: asaasPaymentId,
            step: "tickets_mint",
            ok: false,
            message: "insert failed",
            meta: { error: String(insertErr) }
          });
        } catch {}
        return new Response(JSON.stringify({ ok: false, reason: "ticket_mint_failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      try {
        await sbService.from("finalize_logs").insert({
          reservation_id: reservationId,
          payment_id: asaasPaymentId,
          step: "tickets_minted",
          ok: true,
          message: `minted ${qty} tickets`,
          meta: { raffle_id: reservation.raffle_id }
        });
      } catch {}
    } else {
      try {
        await sbService.from("finalize_logs").insert({
          reservation_id: reservationId,
          payment_id: asaasPaymentId,
          step: "tickets_exist",
          ok: true,
          message: `existing tickets: ${existingCount}`,
        });
      } catch {}
    }

    // 6) Mark applied (idempotency record) LAST
    let appliedInsertError: unknown = null;
    try {
      const { error: aErr } = await sbService.from("payments_applied").insert({
        payment_id: asaasPaymentId,
        reservation_id: reservationId,
        user_id: reservation.user_id,
        applied_at: new Date().toISOString(),
      });
      if (aErr) appliedInsertError = aErr;
    } catch (e) {
      appliedInsertError = e;
    }

    if (appliedInsertError) {
      // If conflict (already inserted), consider done
      const msg = String(appliedInsertError);
      const isConflict = msg.includes("duplicate key") || msg.includes("already exists") || msg.includes("23505");
      try {
        await sbService.from("finalize_logs").insert({
          reservation_id: reservationId,
          payment_id: asaasPaymentId,
          step: "applied_insert",
          ok: isConflict,
          message: isConflict ? "conflict-ok" : "insert failed",
          meta: { error: msg }
        });
      } catch {}
      if (!isConflict) {
        return new Response(JSON.stringify({ ok: false, reason: "applied_insert_failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 7) Success
    try {
      await sbService.from("audit_logs").insert({
        user_id: user.id,
        action: "finalize_payment_success",
        context: {
          reservation_id: reservationId,
          asaas_payment_id: asaasPaymentId,
          tickets_created: !existingCount || existingCount === 0,
        }
      });
    } catch {}

    return new Response(JSON.stringify({
      ok: true,
      finalized: true,
      reservation_id: reservationId,
      tickets_created: !existingCount || existingCount === 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[finalize-payment] Unexpected error:", error);
    
    // Log the exception for debugging
    try {
      await sbService.from("audit_logs").insert({
        user_id: null,
        action: "finalize_payment_exception",
        context: {
          error: String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      });
    } catch (logError) {
      console.warn("[finalize-payment] Failed to log exception:", logError);
    }

    return new Response(JSON.stringify({ 
      ok: false, 
      reason: "internal_error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});