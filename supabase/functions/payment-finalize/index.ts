import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://ganhavel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  
  try {
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Bearer" }), { status: 401, headers: cors });
    }
    const jwt = auth.slice(7);

    const { reservationId, paymentId, name, phone, cpf } = await req.json();

    if (!reservationId) {
      return new Response(JSON.stringify({ error: "Missing reservationId" }), { status: 400, headers: cors });
    }

    // RLS user client for ownership check
    const SB_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON  = Deno.env.get("SUPABASE_ANON_KEY")!;
    const user  = createClient(SB_URL, ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } });

    // Ownership: ensure the reservation belongs to this user (via tickets or reservations table)
    const { data: own } = await user
      .from("tickets")
      .select("reservation_id")
      .eq("reservation_id", reservationId)
      .limit(1)
      .maybeSingle();
    
    if (!own) {
      return new Response(JSON.stringify({ error: "Not found or not your reservation" }), { status: 403, headers: cors });
    }

    // Service role to run RPC
    const SRV_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin   = createClient(SB_URL, SRV_KEY);
    
    const { data, error } = await admin.rpc("finalize_paid_purchase", {
      p_reservation_id: reservationId,
      p_asaas_payment_id: paymentId ?? null,
      p_customer_name: name ?? null,
      p_customer_phone: phone ?? null,
      p_customer_cpf: cpf ?? null,
    });
    
    if (error) {
      console.error('[payment-finalize] RPC error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: cors });
    }

    console.log('[payment-finalize] Purchase finalized successfully:', data);
    return new Response(JSON.stringify({ ok: true, result: data }), { status: 200, headers: cors });
    
  } catch (e) {
    console.error('[payment-finalize] Error:', e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});