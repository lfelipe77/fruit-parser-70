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

    // 4) Check idempotency - has this payment already been processed?
    const { data: existingTransaction } = await sbService
      .from("transactions")
      .select("id, status")
      .eq("reservation_id", reservationId)
      .eq("provider_payment_id", asaasPaymentId)
      .maybeSingle();

    if (existingTransaction) {
      console.log(`[finalize-payment] Payment already processed: ${existingTransaction.id}`);
      return new Response(JSON.stringify({ 
        ok: true, 
        already_processed: true,
        transaction_id: existingTransaction.id
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // 5) Call the existing finalize_paid_purchase RPC (creates tickets, transaction, updates counters)
    console.log("[finalize-payment] Calling finalize_paid_purchase RPC");
    
    const { data: finalizeResult, error: finalizeError } = await sbService.rpc('finalize_paid_purchase', {
      p_reservation_id: reservationId,
      p_asaas_payment_id: asaasPaymentId,
      p_customer_name: customerName,
      p_customer_phone: customerPhone,
      p_customer_cpf: customerCpf
    });

    if (finalizeError) {
      console.error("[finalize-payment] RPC finalization error:", finalizeError);
      
      // Check if it's already finalized (idempotent behavior from RPC)
      if (finalizeError.message?.includes('already_finalized') || finalizeError.message?.includes('already processed')) {
        return new Response(JSON.stringify({
          ok: true,
          already_finalized: true,
          reservation_id: reservationId
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Log the error for debugging
      try {
        await sbService.from("audit_logs").insert({
          user_id: user.id,
          action: "finalize_payment_error",
          context: {
            reservation_id: reservationId,
            asaas_payment_id: asaasPaymentId,
            error: finalizeError.message,
            error_code: finalizeError.code
          }
        });
      } catch (logError) {
        console.warn("[finalize-payment] Failed to log error:", logError);
      }

      return new Response(JSON.stringify({ 
        ok: false, 
        reason: "finalization_failed",
        error: finalizeError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`[finalize-payment] Successfully finalized:`, finalizeResult);

    // 6) Log successful finalization
    try {
      await sbService.from("audit_logs").insert({
        user_id: user.id,
        action: "finalize_payment_success",
        context: {
          reservation_id: reservationId,
          asaas_payment_id: asaasPaymentId,
          result: finalizeResult
        }
      });
    } catch (logError) {
      console.warn("[finalize-payment] Failed to log success:", logError);
    }

    return new Response(JSON.stringify({
      ok: true,
      finalized: true,
      result: finalizeResult,
      reservation_id: reservationId
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