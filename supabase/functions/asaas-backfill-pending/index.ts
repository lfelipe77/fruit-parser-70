// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

const ASAAS_API = "https://api.asaas.com/v3";

function json(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

  // Authorization check
  const authHeader = req.headers.get("Authorization");
  const SB_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY");
  const BACKFILL_SECRET = Deno.env.get("BACKFILL_SECRET");
  
  let authorized = false;
  if (authHeader && SB_SERVICE_ROLE_KEY && authHeader === `Bearer ${SB_SERVICE_ROLE_KEY}`) {
    authorized = true;
  } else if (BACKFILL_SECRET && authHeader === `Bearer ${BACKFILL_SECRET}`) {
    authorized = true;
  }
  
  if (!authorized) {
    return json(401, { error: "Unauthorized. Requires service role key or backfill secret." });
  }

  let body: any;
  try { 
    body = await req.json(); 
  } catch { 
    body = {}; 
  }

  const limit = Math.min(body?.limit || 20, 50); // Cap at 50 for safety

  // Environment variables
  const API_KEY = Deno.env.get("ASAAS_API_KEY");
  const SB_URL = Deno.env.get("SB_URL");
  const CUSTOMER_ID = "cus_000132351463";

  if (!API_KEY) return json(500, { error: "Missing ASAAS_API_KEY" });
  if (!SB_URL || !SB_SERVICE_ROLE_KEY) return json(500, { error: "Missing Supabase credentials" });

  const sb = createClient(SB_URL, SB_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    // Get first N rows from payments_pending where asaas_payment_id IS NULL
    const { data: pendingRows, error: selectError } = await sb
      .from("payments_pending")
      .select("reservation_id, amount")
      .is("asaas_payment_id", null)
      .limit(limit);

    if (selectError) {
      return json(500, { error: "Failed to fetch pending payments", details: selectError });
    }

    if (!pendingRows || pendingRows.length === 0) {
      return json(200, { processed: 0, successes: 0, failures: 0, items: [], message: "No pending payments to backfill" });
    }

    const results: any[] = [];
    let successes = 0;
    let failures = 0;

    for (const row of pendingRows) {
      const { reservation_id, amount } = row;
      
      try {
        // Create Asaas payment
        const value = Number(Number(amount ?? 5).toFixed(2)) || 5.00;
        const dueDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        
        const asaasPayload = {
          customer: CUSTOMER_ID,
          billingType: "PIX",
          value,
          dueDate,
          externalReference: reservation_id,
          description: "Ganhavel - Backfill de rifa"
        };

        console.log(`[backfill] Creating payment for reservation ${reservation_id}, amount ${value}`);

        const res = await fetch(`${ASAAS_API}/payments`, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            access_token: API_KEY,
            "User-Agent": "Ganhavel/1.0 (backfill)",
          },
          body: JSON.stringify(asaasPayload),
        });

        const raw = await res.text();
        
        if (!res.ok) {
          let details;
          try { 
            details = JSON.parse(raw); 
          } catch { 
            details = { raw }; 
          }
          
          console.error(`[backfill] Asaas error for ${reservation_id}:`, { status: res.status, details });
          
          results.push({
            reservation_id,
            error: `Asaas API error: ${res.status}`,
            details
          });
          failures++;
          continue;
        }

        const created = JSON.parse(raw);
        const asaas_payment_id = created?.id;
        
        if (!asaas_payment_id) {
          console.error(`[backfill] No payment ID returned for ${reservation_id}:`, created);
          results.push({
            reservation_id,
            error: "No payment ID in Asaas response",
            asaas_response: created
          });
          failures++;
          continue;
        }

        // Update payments_pending
        const { error: updatePendingError } = await sb
          .from("payments_pending")
          .update({
            asaas_payment_id,
            updated_at: new Date().toISOString()
          })
          .eq("reservation_id", reservation_id);

        if (updatePendingError) {
          console.error(`[backfill] Failed to update payments_pending for ${reservation_id}:`, updatePendingError);
        }

        // Update/insert purchase_payments
        const { error: updatePurchaseError } = await sb
          .from("purchase_payments")
          .upsert({
            purchase_id: reservation_id,
            asaas_payment_id,
            status: "pending",
            updated_at: new Date().toISOString()
          }, { onConflict: "purchase_id" });

        if (updatePurchaseError) {
          console.error(`[backfill] Failed to update purchase_payments for ${reservation_id}:`, updatePurchaseError);
        }

        console.log(`[backfill] Success for ${reservation_id}: ${asaas_payment_id}`);
        
        results.push({
          reservation_id,
          ok: true,
          asaas_payment_id
        });
        successes++;

      } catch (error) {
        console.error(`[backfill] Exception for ${reservation_id}:`, error);
        results.push({
          reservation_id,
          ok: false,
          error: (error as any)?.message || String(error)
        });
        failures++;
      }
    }

    return json(200, {
      processed: pendingRows.length,
      successes,
      failures,
      items: results
    });

  } catch (error) {
    console.error("[backfill] Unexpected error:", error);
    return json(500, { 
      error: "Internal server error", 
      details: (error as any)?.message || String(error) 
    });
  }
});