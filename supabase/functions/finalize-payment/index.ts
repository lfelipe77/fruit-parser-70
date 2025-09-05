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

    const onlyDigits = (s?: string) => (s || '').replace(/\D+/g, '');
    const normCpf = (cpf?: string) => onlyDigits(cpf).padStart(11, '0').slice(-11);
    const normPhone = (p?: string) => '+' + onlyDigits(p);

    const reservationId = body?.reservation_id ?? body?.reservationId;
    const asaasPaymentId = body?.asaas_payment_id ?? body?.asaasPaymentId;
    const raffleId = body?.raffle_id ?? body?.raffleId;
    const numbers = Array.isArray(body?.numbers) ? body.numbers : null;

    const buyer = body?.buyer ?? {};
    const buyerName  = (buyer?.name || '').trim().slice(0, 200) || null;
    const buyerPhone = buyer?.phone ? normPhone(buyer.phone) : null;
    const buyerEmail = buyer?.email ? String(buyer.email).trim().toLowerCase() : null;
    const buyerCpf   = buyer?.cpf ? normCpf(buyer.cpf) : null;
    
    if (!reservationId || !asaasPaymentId || !raffleId || !numbers) {
      console.error("[finalize-payment] Missing required fields:", { reservationId, asaasPaymentId, raffleId, hasNumbers: !!numbers });
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
    const { count: tCount, error: tCountErr } = await sbService
      .from("tickets")
      .select("id", { head: true, count: "exact" })
      .eq("reservation_id", reservationId);

    if (tCountErr) {
      console.warn("[finalize-payment] ticket count for guard failed:", tCountErr);
    }

    const hasTickets = (tCount ?? 0) > 0;

    if (applied && hasTickets) {
      console.log(`[finalize-payment] Already finalized (guard+tickets) for reservation ${reservationId}`);
      return ok({ ok: true, already_finalized: true, reservation_id: reservationId });
    }

    // 5) If no tickets exist yet, validate numbers and create ticket + transaction
    // 5a) Validate numbers shape: exactly 5 pairs of two-digit strings
    const sanitize = (s: unknown) => String(s ?? '').replace(/\D/g, '').padStart(2, '0').slice(-2);
    if (!Array.isArray(numbers) || numbers.length !== 5) {
      console.error('[finalize-payment] Invalid numbers payload shape', { numbers });
      return ok({ ok: false, reason: 'bad_numbers' });
    }
    let normNumbers: string[][];
    try {
      normNumbers = numbers.map((pair: unknown) => {
        if (!Array.isArray(pair) || pair.length !== 2) throw new Error('pair_invalid');
        return [sanitize(pair[0]), sanitize(pair[1])];
      });
    } catch {
      return ok({ ok: false, reason: 'bad_numbers' });
    }
    const allNums = normNumbers.flat();

    // 5b) Load raffle to compute price
    const { data: raffleRow, error: raffleErr } = await sbService
      .from('raffles')
      .select('id, ticket_price')
      .eq('id', raffleId)
      .maybeSingle();

    if (raffleErr || !raffleRow || typeof raffleRow.ticket_price !== 'number') {
      console.error('[finalize-payment] Raffle not found or invalid ticket_price', raffleErr);
      return ok({ ok: false, reason: 'raffle_not_found' });
    }

    const unitPrice = raffleRow.ticket_price;

    // 5c) Conflict check - ensure numbers are still free for this raffle
    let conflict = false;
    // Try RPC first if available
    try {
      const { data: hasConflict, error: confErr } = await (sbService as any).rpc('tickets_numbers_conflict', { p_raffle_id: raffleId, p_numbers: allNums });
      if (!confErr && (hasConflict === true || hasConflict === 't')) {
        conflict = true;
      }
    } catch (_) {
      // ignore
    }

    if (!conflict) {
      // Fallback overlap query
      const { data: existingTickets, error: exErr } = await sbService
        .from('tickets')
        .select('numbers, status')
        .eq('raffle_id', raffleId)
        .in('status', ['paid', 'issued', 'reserved']);
      if (exErr) {
        console.warn('[finalize-payment] Conflict fallback query failed', exErr);
      } else if (existingTickets) {
        const taken = new Set<string>();
        for (const t of existingTickets as any[]) {
          const arr = Array.isArray(t.numbers) ? t.numbers : [];
          for (const x of arr) {
            if (Array.isArray(x)) {
              for (const y of x) taken.add(String(y).padStart(2, '0').slice(-2));
            } else {
              taken.add(String(x).padStart(2, '0').slice(-2));
            }
          }
        }
        conflict = allNums.some((p) => taken.has(p));
      }
    }

    if (conflict) {
      return ok({ ok: false, reason: 'numbers_conflict' });
    }

    // 5d) Insert ticket row (bundle of 5 pairs)
    const { data: ticketIns, error: tErr } = await sbService
      .from('tickets')
      .insert([{
        reservation_id: reservationId,
        raffle_id: raffleId,
        user_id: user.id,
        status: 'paid',
        qty: 5,
        unit_price: unitPrice,
        numbers: normNumbers
      }])
      .select('id')
      .single();

    if (tErr) {
      console.error('[finalize-payment] tickets insert failed', tErr);
      return ok({ ok: false, reason: 'tickets_insert_failed' });
    }

    // 5e) Insert transactions row with buyer info and mirror numbers
    const { data: txIns, error: txErr } = await sbService
      .from('transactions')
      .insert({
        raffle_id: raffleId,
        user_id: user.id,
        buyer_user_id: user.id,
        provider: 'asaas',
        provider_payment_id: asaasPaymentId,
        reservation_id: reservationId,
        numbers: normNumbers,
        amount: unitPrice,
        status: 'paid',
        customer_name: buyerName,
        customer_phone: buyerPhone,
        customer_cpf: buyerCpf || null
      })
      .select('id')
      .single();

    if (txErr) {
      console.error('[finalize-payment] transactions insert failed', txErr);
      return ok({ ok: false, reason: 'transactions_insert_failed' });
    }

    // 5f) Link ticket -> transaction
    const { error: linkErr } = await sbService
      .from('tickets')
      .update({ transaction_id: txIns.id })
      .eq('id', ticketIns.id);

    if (linkErr) {
      console.warn('[finalize-payment] ticket link failed', linkErr);
    }

    // 6) Mark applied (idempotency record) LAST
    let appliedInsertError: unknown = null;
    try {
      const { error: aErr } = await sbService.from("payments_applied").insert({
        payment_id: asaasPaymentId,
        reservation_id: reservationId,
        user_id: user.id,
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
        return ok({ ok: false, reason: "applied_insert_failed" });
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
          raffle_id: raffleId
        }
      });
    } catch {}

    return ok({
      ok: true,
      finalized: true,
      reservation_id: reservationId
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