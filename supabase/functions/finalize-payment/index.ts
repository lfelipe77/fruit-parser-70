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

// Unified OK helper to always return 200 with JSON
const ok = (obj: unknown) =>
  new Response(JSON.stringify(obj), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });

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
      return ok({ ok: false, reason: "unauthorized" });
    }

    console.log(`[finalize-payment] User authenticated: ${user.id}`);

    // 2) Parse request body (support snake_case and camelCase)
    const body = await req.json().catch(() => null);
    const reservationId = body?.reservation_id ?? body?.reservationId;
    const asaasPaymentId = body?.asaas_payment_id ?? body?.asaasPaymentId;
    const customerName = body?.customer_name ?? body?.customerName ?? null;
    const customerPhone = body?.customer_phone ?? body?.customerPhone ?? null;
    const customerCpf = body?.customer_cpf ?? body?.customerCpf ?? null;
    
    if (!reservationId || !asaasPaymentId) {
      console.error("[finalize-payment] Missing required fields:", { reservationId, asaasPaymentId });
      return ok({ ok: false, reason: "bad_request_fields" });
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
      return ok({ ok: false, reason: "payment_error" });
    }

    if (!paymentRow || paymentRow.status !== "PAID") {
      console.error("[finalize-payment] Payment not paid:", { status: paymentRow?.status });
      return ok({ ok: false, reason: "not_paid", status: paymentRow?.status });
    }

    // Verify reservation matches payment
    if (paymentRow.reservation_id !== reservationId) {
      console.error("[finalize-payment] Reservation ID mismatch:", { 
        paymentReservation: paymentRow.reservation_id, 
        requestReservation: reservationId 
      });
      return ok({ ok: false, reason: "reservation_mismatch" });
    }

    console.log(`[finalize-payment] Payment verified as PAID: ${paymentRow.amount}`);

    // 4) Idempotency guard via payments_applied + tickets existence
    const { data: applied, error: appliedErr } = await sbService
      .from("payments_applied")
      .select("payment_id, reservation_id")
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
      return ok({ ok: false, reason: "guard_failed" });
    }

    // Count tickets for this reservation
    const { count: tCount, error: tErr } = await sbService
      .from("tickets")
      .select("id", { head: true, count: "exact" })
      .eq("reservation_id", reservationId);

    if (tErr) {
      console.warn("[finalize-payment] ticket count for guard failed:", tErr);
    }

    const hasTickets = (tCount ?? 0) > 0;

    if (applied && hasTickets) {
      console.log(`[finalize-payment] Already finalized (guard+tickets) for reservation ${reservationId}`);
      return ok({ ok: true, already_finalized: true, reservation_id: reservationId });
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
      return ok({ ok: false, reason: "reservation_not_found" });
    }

    if (reservation.user_id !== user.id) {
      console.error("[finalize-payment] Reservation not owned by user", { user: user.id, owner: reservation.user_id });
      return ok({ ok: false, reason: "reservation_not_owned" });
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
        return ok({ ok: false, reason: "invalid_quantity" });
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
        return ok({ ok: false, reason: "ticket_mint_failed" });
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

    return ok({ 
      ok: false, 
      reason: "internal_error" 
    });
  }
});