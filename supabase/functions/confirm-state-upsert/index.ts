import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

type Body = {
  reservation_id: string;
  asaas_payment_id?: string;
  status: "PENDING" | "PAID" | "CANCELLED";
  amount?: number | string;
  expires_at?: string;
  pix_qr_code_id?: string | null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const b = (await req.json()) as Body;
    if (!b?.reservation_id || !b?.status) {
      return new Response(JSON.stringify({ ok:false, reason:"bad_request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Minimal upsert on existing columns only
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
    return new Response(JSON.stringify({ ok:true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("confirm-state-upsert error:", e);
    return new Response(JSON.stringify({ ok:false, reason:"db_error", detail:String(e?.message ?? e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});