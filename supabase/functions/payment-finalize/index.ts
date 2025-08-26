import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.1/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, asaasPaymentId, customerName, customerPhone, customerCpf } = await req.json();

    if (!reservationId || !asaasPaymentId) {
      return new Response(
        JSON.stringify({ error: 'Missing reservationId or asaasPaymentId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[payment-finalize] Finalizing purchase for reservation ${reservationId}, payment ${asaasPaymentId}`);

    // Call the finalize RPC
    const { data, error } = await admin.rpc('finalize_paid_purchase', {
      p_reservation_id: reservationId,
      p_asaas_payment_id: asaasPaymentId,
      p_customer_name: customerName || null,
      p_customer_phone: customerPhone || null,
      p_customer_cpf: customerCpf || null
    });

    if (error) {
      console.error('[payment-finalize] RPC error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to finalize purchase', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (data?.error) {
      console.warn('[payment-finalize] Business logic error:', data.error);
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[payment-finalize] Purchase finalized successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...data 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[payment-finalize] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});