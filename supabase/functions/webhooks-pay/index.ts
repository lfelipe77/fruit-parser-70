import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    // Optional: basic shared secret for webhook security
    const expected = Deno.env.get("WEBHOOK_SECRET");
    const got = req.headers.get("x-webhook-secret") ?? "";
    
    if (expected && got !== expected) {
      console.log("Webhook unauthorized - invalid secret");
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const body = await req.json().catch(() => ({}));
    console.log("Webhook received payload:", body);
    
    const reservation_id = body?.reservation_id as string | undefined;
    const provider_payment_id = body?.provider_payment_id as string | undefined;
    const provider = body?.provider ?? "Asaas";

    if (!reservation_id || !provider_payment_id) {
      console.log("Missing required fields:", { reservation_id, provider_payment_id });
      return new Response("Missing fields: reservation_id and provider_payment_id required", { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // Call the RPC function to mark tickets as paid
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    console.log("Calling mark_tickets_paid_v2 RPC with:", {
      p_reservation_id: reservation_id,
      p_provider: provider,
      p_provider_payment_id: provider_payment_id,
    });

    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/mark_tickets_paid_v2`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        p_reservation_id: reservation_id,
        p_provider: provider,
        p_provider_payment_id: provider_payment_id,
      }),
    });

    if (!rpcResponse.ok) {
      const errorText = await rpcResponse.text();
      console.error("RPC call failed:", errorText);
      return new Response(`RPC failed: ${errorText}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log("Successfully marked tickets as paid");
    return new Response("Payment processed successfully", { 
      status: 200,
      headers: corsHeaders 
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(`Internal server error: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});