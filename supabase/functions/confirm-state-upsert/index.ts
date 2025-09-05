import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',').map(s => s.trim()).filter(Boolean);

function cors(origin: string | null) {
  const allow = origin && (ALLOWED.length === 0 || ALLOWED.includes(origin)) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get('origin');
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: cors(origin) });
    }

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...cors(origin) }
      });
    }

    // Get auth token from header
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...cors(origin) }
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
        headers: { 'Content-Type': 'application/json', ...cors(origin) }
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
        headers: { 'Content-Type': 'application/json', ...cors(origin) }
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
          headers: { 'Content-Type': 'application/json', ...cors(origin) }
        });
      }

      result = updated;
    } else {
      // Insert new record
      const insertData = {
        reservation_id: reservationId,
        raffle_id: raffleId,
        
        qty,
        unit_price: unitPrice,
        amount,
        numbers,
        status: 'PENDING',
        expires_at: expiresAt,
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
          headers: { 'Content-Type': 'application/json', ...cors(origin) }
        });
      }

      result = inserted;
    }

    return new Response(JSON.stringify({
      ok: true,
      pending: result
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...cors(origin) }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...cors(origin) }
    });
  }
}

Deno.serve(handler);