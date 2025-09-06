import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withCORS } from '../_shared/cors.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export default withCORS(async (req: Request): Promise<Response> => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'GET') {
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

    // Get reservationId from query params
    const url = new URL(req.url);
    const reservationId = url.searchParams.get('reservationId');

    if (!reservationId) {
      return new Response(JSON.stringify({ error: 'reservationId query parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // First, try to find in payments_pending
    const { data: pendingPayment } = await supabase
      .from('payments_pending')
      .select('*')
      .eq('reservation_id', reservationId)
      .eq('buyer_user_id', user.id)
      .maybeSingle();

    if (pendingPayment) {
      // Check if there are any paid tickets for this reservation
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id, status')
        .eq('reservation_id', reservationId);

      const hasTicketsPaid = tickets?.some(ticket => ticket.status === 'paid') || false;

      // Determine status
      let status = 'pending';
      if (hasTicketsPaid) {
        status = 'paid';
      } else if (pendingPayment.expires_at && new Date(pendingPayment.expires_at) < new Date()) {
        status = 'expired';
      }

      return new Response(JSON.stringify({
        ok: true,
        source: 'pending',
        reservationId: pendingPayment.reservation_id,
        raffleId: pendingPayment.raffle_id,
        status,
        qty: pendingPayment.qty || 1,
        unitPrice: pendingPayment.unit_price || 0,
        amount: pendingPayment.amount || 0,
        numbers: pendingPayment.numbers || [],
        transaction: {
          id: null,
          provider: null,
          providerPaymentId: null,
          paidAt: null
        },
        debug: {
          hasTicketsPaid
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // If not found in pending, try to find in transactions
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('reservation_id', reservationId)
      .eq('buyer_user_id', user.id)
      .maybeSingle();

    if (transaction) {
      return new Response(JSON.stringify({
        ok: true,
        source: 'transactions',
        reservationId: transaction.reservation_id,
        raffleId: transaction.raffle_id,
        status: transaction.status === 'paid' ? 'paid' : 'failed',
        qty: (transaction.numbers as any[])?.length || 1,
        unitPrice: transaction.amount / ((transaction.numbers as any[])?.length || 1),
        amount: transaction.amount,
        numbers: transaction.numbers || [],
        transaction: {
          id: transaction.id,
          provider: transaction.provider,
          providerPaymentId: transaction.provider_payment_id,
          paidAt: transaction.created_at
        },
        debug: {
          hasTicketsPaid: true
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Not found anywhere
    return new Response(JSON.stringify({
      ok: false,
      error: 'Payment state not found'
    }), {
      status: 404,
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