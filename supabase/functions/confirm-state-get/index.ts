import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }});

const ALLOWED = new Set([
  "https://ganhavel.com",
  "https://www.ganhavel.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED.has(origin) ? origin : "*",
  "Vary": "Origin",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    if (req.method !== "GET") {
      return new Response(JSON.stringify({ ok:false, reason:"method_not_allowed" }), { status: 405, headers });
    }
    const url = new URL(req.url);
    const reservation_id = url.searchParams.get("reservationId") ?? url.searchParams.get("reservation_id");
    if (!reservation_id) {
      return new Response(JSON.stringify({ ok:false, reason:"bad_request", detail:"reservationId required" }), { status: 400, headers });
    }

    const { data, error } = await sb
      .from("payments_pending")
      .select("reservation_id, asaas_payment_id, status, amount, expires_at, updated_at")
      .eq("reservation_id", reservation_id)
      .maybeSingle();

    if (error) throw error;
    return new Response(JSON.stringify({ ok:true, pending: data ?? null }), { status: 200, headers });
  } catch (e: any) {
    console.error("confirm-state-get error:", e);
    return new Response(JSON.stringify({ ok:false, reason:"db_error", detail:String(e?.message ?? e) }), { status: 500, headers });
  }
});