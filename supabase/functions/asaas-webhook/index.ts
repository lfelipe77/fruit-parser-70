// supabase/functions/asaas-webhook/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// Optional: set ASAAS_WEBHOOK_TOKEN in Supabase env. If absent, we accept all requests.
const EXPECTED_TOKEN = (Deno.env.get("ASAAS_WEBHOOK_TOKEN") ?? "").trim();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, access_token, x-access-token, x-asaas-access-token",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: any = null;
  try { body = await req.json(); } catch { body = null; }

  // Soft auth: never block; just mark in logs
  const incomingToken =
    req.headers.get("access_token") ||
    req.headers.get("x-access-token") ||
    req.headers.get("x-asaas-access-token") ||
    "";
  const auth_ok = !EXPECTED_TOKEN || (incomingToken.trim() === EXPECTED_TOKEN);

  // 1) Log (best-effort)
  try {
    await sb.from("asaas_webhook_logs").insert({
      event: body?.payment?.status ?? body?.event ?? "unknown",
      raw: body ?? {},
      received_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Failed to log webhook:", e);
  }

  // 2) Flip DB if paid-like (best-effort + visible errors)
  try {
    const status = body?.payment?.status;
    const id = body?.payment?.id;

    const paidLike = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"].includes(status);
    if (paidLike && id) {
      // Try UPDATE first
      const { data: upd, error: updErr } = await sb
        .from("payments_pending")
        .update({ status: "PAID", updated_at: new Date().toISOString() })
        .eq("asaas_payment_id", id)
        .select("asaas_payment_id"); // returns [] when no row

      const updatedCount = Array.isArray(upd) ? upd.length : 0;

      // If no row was updated, INSERT (idempotent end-state)
      if (!updErr && updatedCount === 0) {
        const { error: insErr } = await sb.from("payments_pending").insert({
          asaas_payment_id: id,
          status: "PAID",
          updated_at: new Date().toISOString(),
        });
        if (insErr) throw insErr;
      }
    }
  } catch (e) {
    // Log handler error into webhook logs (won't block 200)
    try {
      await sb.from("asaas_webhook_logs").insert({
        event: body?.payment?.status ?? body?.event ?? "unknown",
        raw: { ...(body ?? {}), meta: { handler_error: String(e) } },
        received_at: new Date().toISOString(),
      });
    } catch {}
  }

  // 3) Always 200 fast
  return new Response(JSON.stringify({ ok: true, auth_ok }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});