import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Provider = "asaas" | "stripe";
type Body = {
  provider: Provider;
  raffle_id: string;
  reservation_id?: string;
  qty: number;
  amount?: number;   // base ticket revenue (qty * ticket_price)
  unit_price?: number;
  subtotal?: number;
  currency: "BRL";
  selected_numbers?: string[];
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
    const body = (await req.json()) as Body;
    const { provider, raffle_id, reservation_id, qty, amount, subtotal, currency, selected_numbers } = body;

    if (!provider || !raffle_id || !qty || !currency) {
      return new Response("Missing fields", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const finalAmount = subtotal || amount || 0;

    // Fees
    let fee_fixed = 0;
    let fee_pct = 0;
    let fee_amount = 0;

    if (provider === "asaas") {
      fee_fixed = 2.0;   // R$2,00 per purchase
    }
    // Stripe: keep 0; your Stripe pricing is charged to you, not buyer, unless you choose to add it.

    const total_amount = finalAmount + fee_fixed + fee_amount;

    // TODO: Create real checkout with provider SDK/API and get:
    // - provider_payment_id
    // - redirect_url
    const provider_payment_id = `${provider}_${crypto.randomUUID()}`;
    const redirect_url = `https://example.com/checkout/${provider_payment_id}`;

    console.log(`Creating checkout for ${provider}: raffle=${raffle_id}, qty=${qty}, amount=${finalAmount}, fees=${fee_fixed}, total=${total_amount}`);

    // Persist transaction with selected numbers using service role
    if (reservation_id) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        
        const authHeader = req.headers.get("Authorization");
        let userIdFromJWT = null;
        
        if (authHeader) {
          try {
            // Extract user ID from JWT if available
            const token = authHeader.replace("Bearer ", "");
            const payload = JSON.parse(atob(token.split('.')[1]));
            userIdFromJWT = payload.sub;
          } catch (e) {
            console.warn("Could not extract user ID from JWT:", e);
          }
        }

        await fetch(`${supabaseUrl}/rest/v1/transactions`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            raffle_id: raffle_id,
            user_id: userIdFromJWT,
            reservation_id: reservation_id,
            amount: finalAmount,
            currency: currency,
            provider: provider,
            provider_payment_id: provider_payment_id,
            status: "pending",
            selected_numbers: selected_numbers || null
          })
        });
      } catch (persistErr) {
        console.error("Failed to persist transaction:", persistErr);
        // Don't fail the checkout, just log the error
      }
    }

    return new Response(JSON.stringify({
      provider,
      provider_payment_id,
      redirect_url,
      fee_fixed,
      fee_pct,
      fee_amount,
      amount: finalAmount,        // base ticket revenue
      total_amount,  // buyer pays this
      raffle_id,
      qty,
      currency
    }), { 
      status: 200, 
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      } 
    });
  } catch (e) {
    console.error("Create checkout error:", e);
    return new Response("Internal Error", { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});
