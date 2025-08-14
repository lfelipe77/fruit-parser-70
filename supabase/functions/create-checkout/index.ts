import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Provider = "asaas" | "stripe";
type Body = {
  provider: Provider;
  raffle_id: string;
  qty: number;
  amount: number;   // base ticket revenue (qty * ticket_price)
  currency: "BRL";
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
    const { provider, raffle_id, qty, amount, currency } = (await req.json()) as Body;

    if (!provider || !raffle_id || !qty || !amount || !currency) {
      return new Response("Missing fields", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Fees
    let fee_fixed = 0;
    let fee_pct = 0;
    let fee_amount = 0;

    if (provider === "asaas") {
      fee_fixed = 2.0;   // R$2,00 per purchase
    }
    // Stripe: keep 0; your Stripe pricing is charged to you, not buyer, unless you choose to add it.

    const total_amount = amount + fee_fixed + fee_amount;

    // TODO: Create real checkout with provider SDK/API and get:
    // - provider_payment_id
    // - redirect_url
    const provider_payment_id = `${provider}_${crypto.randomUUID()}`;
    const redirect_url = `https://example.com/checkout/${provider_payment_id}`;

    console.log(`Creating checkout for ${provider}: raffle=${raffle_id}, qty=${qty}, amount=${amount}, fees=${fee_fixed}, total=${total_amount}`);

    return new Response(JSON.stringify({
      provider,
      provider_payment_id,
      redirect_url,
      fee_fixed,
      fee_pct,
      fee_amount,
      amount,        // base ticket revenue
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
