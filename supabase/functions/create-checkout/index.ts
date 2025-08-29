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
  reservation_id?: string; // optional reservation to propagate for idempotency
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
    const { provider, raffle_id, qty, amount, currency, reservation_id } = (await req.json()) as Body;

    if (!provider || !raffle_id || !qty || !amount || !currency) {
      return new Response("Missing fields", { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Validate minimum charge requirements server-side
    const fee_fixed = 2.0;   // R$2,00 per purchase (institutional fee)
    const subtotal = amount; // tickets only (what counts toward raffle progress)
    const charge_total = subtotal + fee_fixed; // what buyer pays
    
    // Reject if doesn't meet minimum charge requirement
    if (subtotal < 3.00 || charge_total < 5.00) {
      return new Response(JSON.stringify({
        error: "Minimum charge requirement not met",
        minimum_subtotal: 3.00,
        minimum_charge_total: 5.00,
        received_subtotal: subtotal,
        received_charge_total: charge_total
      }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let fee_pct = 0;
    let fee_amount = 0;

    // TODO: Create real checkout with provider SDK/API
    // IMPORTANT: Use value = charge_total (subtotal + institutional fee)
    const provider_payment_id = `${provider}_${crypto.randomUUID()}`;
    const redirect_url = `https://example.com/checkout/${provider_payment_id}`;

    console.log(`Creating checkout for ${provider}: raffle=${raffle_id}, qty=${qty}, subtotal=${subtotal.toFixed(2)}, fee=${fee_fixed.toFixed(2)}, charge_total=${charge_total.toFixed(2)}, reservation_id=${reservation_id || 'none'}`);

    return new Response(JSON.stringify({
      provider,
      provider_payment_id,
      redirect_url,
      reservation_id,
      fee_fixed,
      fee_pct,
      fee_amount,
      amount: subtotal,      // base ticket revenue (excludes institutional fee)
      charge_total,          // buyer pays this (includes institutional fee)
      total_amount: charge_total, // legacy compatibility
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
