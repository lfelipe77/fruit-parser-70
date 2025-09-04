import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get auth token from header
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await req.json();
    const {
      reservationId,
      asaasPaymentId,
      customerName,
      customerPhone,
      customerCpf
    } = body;

    if (!reservationId) {
      return new Response(JSON.stringify({ error: 'reservationId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[finalize-payment] Processing reservation: ${reservationId}`);

    // Check if payment is confirmed
    const { data: payment } = await supabase
      .from('payments_pending')
      .select('status, asaas_payment_id')
      .eq('reservation_id', reservationId)
      .maybeSingle();

    if (!payment || payment.status !== 'PAID') {
      return new Response(JSON.stringify({ 
        error: 'Payment not confirmed',
        status: payment?.status || 'not_found'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call the finalize_paid_purchase function (idempotent)
    const { data: finalizeResult, error: finalizeError } = await supabase.rpc('finalize_paid_purchase', {
      p_reservation_id: reservationId,
      p_asaas_payment_id: asaasPaymentId || payment.asaas_payment_id,
      p_customer_name: customerName,
      p_customer_phone: customerPhone,
      p_customer_cpf: customerCpf
    });

    if (finalizeError) {
      console.error('Finalization error:', finalizeError);
      
      // Check if it's already finalized (idempotent behavior)
      if (finalizeError.message?.includes('already_finalized')) {
        return new Response(JSON.stringify({
          ok: true,
          already_finalized: true,
          reservation_id: reservationId
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ error: 'Failed to finalize payment' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[finalize-payment] Successfully finalized reservation: ${reservationId}`);

    return new Response(JSON.stringify({
      ok: true,
      finalized: true,
      result: finalizeResult
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});