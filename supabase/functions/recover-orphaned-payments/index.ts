import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
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

function toFiveSingles(anyShape: unknown): string[] {
  const txt = typeof anyShape === "string" ? anyShape : JSON.stringify(anyShape ?? "");
  const matches = txt.match(/\d{2}/g) ?? [];
  return [0,1,2,3,4].map(i => (matches[i] ?? "00").padStart(2,"0"));
}

serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok:false, reason:"method_not_allowed" }), { status: 405, headers });
    }

    // Find orphaned PAID payments with no corresponding transactions
    const { data: orphaned, error: orphanedErr } = await sb
      .from("payments_pending")
      .select("reservation_id, asaas_payment_id, amount, updated_at")
      .eq("status", "PAID")
      .gte("updated_at", "2025-09-05T00:00:00Z");
    
    if (orphanedErr) throw orphanedErr;

    const results = [];
    
    for (const payment of orphaned || []) {
      // Check if transaction already exists
      const { data: existingTx } = await sb
        .from("transactions")
        .select("id")
        .eq("reservation_id", payment.reservation_id)
        .maybeSingle();
        
      if (existingTx) {
        results.push({ reservation_id: payment.reservation_id, status: "already_exists" });
        continue;
      }

      // Try to recover from Asaas events
      const { data: asaasEvent } = await sb
        .from("asaas_events")
        .select("payload")
        .eq("payload->>'id'", payment.asaas_payment_id)
        .order("received_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      let raffle_id = null;
      let buyer_user_id = null;
      let numbers5: string[] = ["00", "00", "00", "00", "00"];

      if (asaasEvent?.payload) {
        const payload = asaasEvent.payload as any;
        raffle_id = payload.externalReference || null;
        buyer_user_id = payload.customer?.email ? await getUserIdByEmail(payload.customer.email) : null;
        
        // Generate random numbers as fallback
        numbers5 = [
          String(Math.floor(Math.random() * 100)).padStart(2, "0"),
          String(Math.floor(Math.random() * 100)).padStart(2, "0"),
          String(Math.floor(Math.random() * 100)).padStart(2, "0"),
          String(Math.floor(Math.random() * 100)).padStart(2, "0"),
          String(Math.floor(Math.random() * 100)).padStart(2, "0"),
        ];
      }

      if (!raffle_id || !buyer_user_id) {
        results.push({ 
          reservation_id: payment.reservation_id, 
          status: "insufficient_data",
          reason: `missing raffle_id: ${!raffle_id}, missing buyer_user_id: ${!buyer_user_id}`
        });
        continue;
      }

      // Create transaction record
      const { data: newTx, error: txErr } = await sb
        .from("transactions")
        .insert({
          raffle_id,
          reservation_id: payment.reservation_id,
          buyer_user_id,
          status: "paid",
          provider: "asaas",
          provider_payment_id: payment.asaas_payment_id,
          amount: payment.amount,
          numbers: numbers5,
        })
        .select("id")
        .single();

      if (txErr) {
        results.push({ 
          reservation_id: payment.reservation_id, 
          status: "tx_creation_failed", 
          error: txErr.message 
        });
        continue;
      }

      // Create aggregate ticket record
      const { error: ticketErr } = await sb
        .from("tickets")
        .insert({
          transaction_id: newTx.id,
          raffle_id,
          user_id: buyer_user_id,
          status: "paid",
          reservation_id: payment.reservation_id,
          numbers: numbers5,
        });

      if (ticketErr) {
        console.error("Ticket creation failed:", ticketErr);
      }

      results.push({ 
        reservation_id: payment.reservation_id, 
        status: "recovered",
        transaction_id: newTx.id
      });
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      processed: results.length,
      results 
    }), { status: 200, headers });

  } catch (e: any) {
    console.error("Recovery error:", e);
    return new Response(JSON.stringify({ 
      ok: false, 
      reason: "recovery_error", 
      detail: String(e?.message ?? e) 
    }), { status: 500, headers });
  }
});

async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data, error } = await sb.auth.admin.getUserByEmail(email);
    return data?.user?.id || null;
  } catch {
    return null;
  }
}