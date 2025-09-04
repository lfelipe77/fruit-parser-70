import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

async function handler(req: Request): Promise<Response> {
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
      raffleId,
      qty = 1,
      unitPrice = 0,
      amount = 0,
      numbers = [],
      buyerUserId,
      pageFingerprint,
      uiState = {}
    } = body;

    if (!reservationId || !raffleId) {
      return new Response(JSON.stringify({ error: 'reservationId and raffleId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate expires_at (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Check if record exists
    const { data: existing } = await supabase
      .from('payments_pending')
      .select('*')
      .eq('reservation_id', reservationId)
      .maybeSingle();

    let result;

    if (existing) {
      // Update existing record, merging ui_state and not overwriting non-null values with null
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Only update non-null values
      if (raffleId) updateData.raffle_id = raffleId;
      if (qty) updateData.qty = qty;
      if (unitPrice) updateData.unit_price = unitPrice;
      if (amount) updateData.amount = amount;
      if (numbers && numbers.length > 0) updateData.numbers = numbers;
      if (buyerUserId) updateData.buyer_user_id = buyerUserId;
      if (pageFingerprint) updateData.page_fingerprint = pageFingerprint;

      // Merge ui_state
      if (uiState && Object.keys(uiState).length > 0) {
        const currentUiState = existing.ui_state || {};
        updateData.ui_state = { ...currentUiState, ...uiState };
      }

      const { data: updated, error: updateError } = await supabase
        .from('payments_pending')
        .update(updateData)
        .eq('reservation_id', reservationId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update payment state' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      result = updated;
    } else {
      // Insert new record
      const insertData = {
        reservation_id: reservationId,
        raffle_id: raffleId,
        buyer_user_id: buyerUserId || user.id,
        qty,
        unit_price: unitPrice,
        amount,
        numbers,
        status: 'PENDING',
        expires_at: expiresAt,
        page_fingerprint: pageFingerprint,
        ui_state: uiState,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: inserted, error: insertError } = await supabase
        .from('payments_pending')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(JSON.stringify({ error: 'Failed to create payment state' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      result = inserted;
    }

    return new Response(JSON.stringify({
      ok: true,
      pending: result
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
}

export default handler;