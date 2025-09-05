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

type Body = {
  reservation_id: string;
  asaas_payment_id?: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  amount?: number | string;
  expires_at?: string;
  pix_qr_code_id?: string | null;
};

serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok:false, reason:"method_not_allowed" }), { status: 405, headers });
    }

    const b = (await req.json()) as Body;
    if (!b?.reservation_id || !b?.status) {
      return new Response(JSON.stringify({ ok:false, reason:"bad_request" }), { status: 400, headers });
    }

    const { error } = await sb
      .from("payments_pending")
      .upsert({
        reservation_id: b.reservation_id,
        asaas_payment_id: b.asaas_payment_id ?? null,
        status: b.status,
        amount: b.amount ?? null,
        expires_at: b.expires_at ?? null,
        pix_qr_code_id: b.pix_qr_code_id ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "reservation_id" });

    if (error) throw error;
    return new Response(JSON.stringify({ ok:true }), { status: 200, headers });
  } catch (e: any) {
    console.error("confirm-state-upsert error:", e);
    return new Response(JSON.stringify({ ok:false, reason:"db_error", detail:String(e?.message ?? e) }), { status: 500, headers });
  }
});