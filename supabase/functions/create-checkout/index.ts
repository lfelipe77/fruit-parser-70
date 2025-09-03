import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Provider = "asaas" | "stripe";
type Body = {
  provider: Provider;
  method?: string;
  raffle_id: string;
  qty: number;
  amount: number;   // base ticket revenue (qty * ticket_price)
  currency: "BRL";
  reservation_id?: string; // optional reservation to propagate for idempotency
  buyer?: {
    fullName: string;
    phone: string;
    cpf: string;
  };
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
    const { provider, method, raffle_id, qty, amount, currency, reservation_id, buyer } = (await req.json()) as Body;

    if (!provider || !raffle_id || !qty || !currency) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle Asaas PIX payments
    if (provider === 'asaas' && method === 'pix') {
      if (!reservation_id) {
        return new Response(JSON.stringify({ error: "reservation_id required for Asaas PIX" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Get raffle price server-side
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('ticket_price')
        .eq('id', raffle_id)
        .single();

      if (raffleError || !raffleData) {
        return new Response(JSON.stringify({ error: "Raffle not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // Compute value server-side
      const ticketPrice = parseFloat(raffleData.ticket_price || '0');
      const value = (ticketPrice * qty).toFixed(2);

      // Check for existing payment
      const { data: existingPayment } = await supabase
        .from('payments_pending')
        .select('reservation_id, asaas_payment_id, ui_state')
        .eq('reservation_id', reservation_id)
        .single();

      let asaasPaymentId = existingPayment?.asaas_payment_id;
      let invoiceUrl = '';

      if (!asaasPaymentId) {
        // Create new Asaas payment
        const asaasApiKey = Deno.env.get('ASAAS_API_KEY');
        const asaasCustomerId = Deno.env.get('ASAAS_DEFAULT_CUSTOMER_ID');

        if (!asaasApiKey || !asaasCustomerId) {
          return new Response(JSON.stringify({ error: "Asaas configuration missing" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd

        const asaasPayload = {
          customer: asaasCustomerId,
          billingType: "PIX",
          value: value,
          dueDate: today,
          externalReference: reservation_id,
          description: "Ganhavel - Compra de rifa"
        };

        const asaasResponse = await fetch('https://api.asaas.com/v3/payments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${asaasApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(asaasPayload),
        });

        if (!asaasResponse.ok) {
          const errorText = await asaasResponse.text();
          console.error('Asaas API error:', errorText);
          return new Response(JSON.stringify({ error: "Payment creation failed" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        const asaasData = await asaasResponse.json();
        asaasPaymentId = asaasData.id;
        invoiceUrl = asaasData.invoiceUrl || '';

        // Get PIX QR Code
        let pixData = null;
        try {
          const pixResponse = await fetch(`https://api.asaas.com/v3/payments/${asaasPaymentId}/pixQrCode`, {
            headers: {
              'Authorization': `Bearer ${asaasApiKey}`,
            },
          });

          if (pixResponse.ok) {
            pixData = await pixResponse.json();
          }
        } catch (error) {
          console.warn('Failed to get PIX QR code:', error);
        }

        // Update payments_pending
        const uiState = {
          ...(existingPayment?.ui_state || {}),
          pix: pixData
        };

        await supabase
          .from('payments_pending')
          .update({
            asaas_payment_id: asaasPaymentId,
            ui_state: uiState
          })
          .eq('reservation_id', reservation_id);

        // Upsert purchase_payments
        await supabase
          .from('purchase_payments')
          .upsert({
            purchase_id: reservation_id,
            provider: 'asaas',
            provider_payment_id: asaasPaymentId,
            status: 'pending',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'purchase_id,provider'
          });

        console.log(`Created Asaas PIX payment: ${asaasPaymentId} for reservation: ${reservation_id}`);
      } else {
        console.log(`Reusing existing Asaas PIX payment: ${asaasPaymentId} for reservation: ${reservation_id}`);
      }

      return new Response(JSON.stringify({
        asaas_payment_id: asaasPaymentId,
        invoiceUrl
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Fallback for other providers (original mock logic)
    const fee_fixed = 2.0;
    const subtotal = amount;
    const charge_total = subtotal + fee_fixed;
    
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

    const provider_payment_id = `${provider}_${crypto.randomUUID()}`;
    const redirect_url = `https://example.com/checkout/${provider_payment_id}`;

    console.log(`Creating checkout for ${provider}: raffle=${raffle_id}, qty=${qty}, subtotal=${subtotal.toFixed(2)}`);

    return new Response(JSON.stringify({
      provider,
      provider_payment_id,
      redirect_url,
      reservation_id,
      fee_fixed,
      fee_pct: 0,
      fee_amount: 0,
      amount: subtotal,
      charge_total,
      total_amount: charge_total,
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
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
