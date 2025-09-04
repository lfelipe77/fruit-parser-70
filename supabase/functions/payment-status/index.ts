import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const { provider, payment_id } = await req.json();

    if (provider !== "asaas" || !payment_id) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Check Asaas API for payment status
    const asaasKey = Deno.env.get("ASAAS_API_KEY");
    if (!asaasKey) {
      return new Response(JSON.stringify({ error: "Missing Asaas API key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const asaasResp = await fetch(`https://sandbox.asaas.com/api/v3/payments/${payment_id}`, {
      headers: {
        "access_token": asaasKey,
        "Content-Type": "application/json"
      }
    });

    if (!asaasResp.ok) {
      console.warn(`[Payment Status] Asaas API error: ${asaasResp.status}`);
      return new Response(JSON.stringify({ error: "Asaas API error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const payment = await asaasResp.json();
    const status = payment?.status || "";
    
    console.log(`[Payment Status] Asaas status for ${payment_id}: ${status}`);

    // If paid, update our database
    const paidStatuses = ["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"];
    if (paidStatuses.includes(status)) {
      const { error } = await supabase
        .from("payments_pending")
        .update({
          status: "PAID",
          updated_at: new Date().toISOString()
        })
        .eq("asaas_payment_id", payment_id);

      if (error) {
        console.warn("[Payment Status] DB update error:", error);
      } else {
        console.log(`[Payment Status] Updated ${payment_id} to PAID`);
      }
    }

    return new Response(JSON.stringify({ 
      status,
      isPaid: paidStatuses.includes(status)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error("[Payment Status] Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});