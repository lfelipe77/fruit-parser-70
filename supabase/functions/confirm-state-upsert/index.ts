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

    const raw: any = await req.json().catch(() => ({}));
    const reservation_id = raw.reservation_id ?? raw.reservationId;
    const status: Body["status"] = (raw.status ?? 'PENDING');
    const asaas_payment_id = raw.asaas_payment_id ?? raw.asaasPaymentId ?? null;
    const amount = raw.amount ?? raw.subtotal ?? null;
    const expires_at = raw.expires_at ?? raw.expiresAt ?? null;
    const pix_qr_code_id = raw.pix_qr_code_id ?? raw.pixQrCodeId ?? null;
    const numbers = raw.numbers ?? null;
    const buyer = raw.buyer ?? raw.buyerUserId ?? raw.buyer_user_id ?? null;

    if (!reservation_id) {
      return new Response(JSON.stringify({ ok:false, reason:"bad_request", detail:"Missing reservation_id|reservationId", got:Object.keys(raw) }), { status: 400, headers });
    }

    const { error } = await sb
      .from("payments_pending")
      .upsert({
        reservation_id,
        asaas_payment_id,
        status,
        amount,
        expires_at,
        pix_qr_code_id,
        numbers,
        buyer,
        updated_at: new Date().toISOString(),
      }, { onConflict: "reservation_id" });


    if (error) throw error;
    return new Response(JSON.stringify({ ok:true }), { status: 200, headers });
  } catch (e: any) {
    console.error("confirm-state-upsert error:", e);
    return new Response(JSON.stringify({ ok:false, reason:"db_error", detail:String(e?.message ?? e) }), { status: 500, headers });
  }
});