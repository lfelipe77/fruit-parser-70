import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withCORS } from "../_shared/cors.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TicketRow {
  raffle_id: string;
  raffle_title: string;
  raffle_image_url: string | null;
  purchase_date: string;
  tx_status: string;
  value: number;
  ticket_count: number;
  purchased_numbers: any;
  progress_pct_money: number;
  draw_date: string | null;
  transaction_id: string;
  buyer_user_id: string;
  goal_amount: number;
  amount_raised: number;
}

interface ConsolidatedTicket {
  raffleId: string;
  raffleTitle: string;
  raffleImageUrl: string | null;
  purchaseDate: string;
  status: string;
  value: number;
  ticketCount: number;
  purchasedNumbers: any[]; // Keep as any[] to preserve combo structure
  progressPctMoney: number;
  drawDate: string | null;
  transactionId: string | null;
  goalAmount: number;
  amountRaised: number;
}

function normalizeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'paid': 'paid',
    'pending': 'pending',
    'confirmed': 'paid',
    'processing': 'pending',
    'completed': 'paid',
    'refunded': 'refunded',
    'failed': 'failed',
    'cancelled': 'failed',
    'settled': 'settled'
  };
  return statusMap[status?.toLowerCase()] || 'pending';
}

function consolidateByRaffle(rows: any[]): ConsolidatedTicket[] {
  const raffleMap = new Map<string, ConsolidatedTicket>();
  
  for (const row of rows) {
    const existing = raffleMap.get(row.raffle_id);
    
    // Extract raffle data from nested object
    const raffle = row.raffles;
    const combos = Array.isArray(row.purchased_numbers) ? row.purchased_numbers : [];
    const ticketCount = combos.length || 1;
    
    // Calculate progress percentage
    const goalAmount = Number(raffle?.goal_amount) || 0;
    const amountRaised = Number(raffle?.amount_raised) || 0;
    const progressPctMoney = goalAmount > 0 ? Math.min(100, (amountRaised / goalAmount) * 100) : 0;
    
    if (!existing) {
      raffleMap.set(row.raffle_id, {
        raffleId: row.raffle_id,
        raffleTitle: raffle?.raffle_title || 'Untitled',
        raffleImageUrl: raffle?.raffle_image_url || null,
        purchaseDate: row.purchase_date,
        status: normalizeStatus(row.tx_status),
        value: Number(row.amount) || 0,
        ticketCount: ticketCount,
        purchasedNumbers: combos,
        progressPctMoney: progressPctMoney,
        drawDate: raffle?.draw_date || null,
        transactionId: row.transaction_id,
        goalAmount: goalAmount,
        amountRaised: amountRaised
      });
    } else {
      // Merge with existing
      existing.value += Number(row.amount) || 0;
      
      // Merge combos
      existing.purchasedNumbers = [...(existing.purchasedNumbers as any[]), ...combos];
      existing.ticketCount += ticketCount;
      
      // Keep most recent purchase date and status
      if (new Date(row.purchase_date) > new Date(existing.purchaseDate)) {
        existing.purchaseDate = row.purchase_date;
        existing.status = normalizeStatus(row.tx_status);
        existing.transactionId = row.transaction_id;
      }
    }
  }
  
  return Array.from(raffleMap.values());
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor');
    const limit = Math.min(50, parseInt(url.searchParams.get('limit') || '20'));
    const wonOnly = url.searchParams.get('wonOnly') === 'true';

    console.log(`[my-tickets-get] User: ${user.id}, limit: ${limit}, wonOnly: ${wonOnly}, cursor: ${cursor}`);

    // Build query directly from transactions and raffles
    let query = supabaseClient
      .from('transactions')
      .select(`
        id as transaction_id,
        raffle_id,
        amount,
        status as tx_status,
        numbers as purchased_numbers,
        created_at as purchase_date,
        user_id as buyer_user_id,
        raffles!inner(
          title as raffle_title,
          image_url as raffle_image_url,
          goal_amount,
          amount_raised,
          draw_date,
          winner_ticket_id
        )
      `)
      .eq('user_id', user.id);

    // Apply won filter
    if (wonOnly) {
      query = query.not('raffles.winner_ticket_id', 'is', null);
    }

    // Apply cursor pagination
    if (cursor) {
      const [cursorDate, cursorId] = cursor.split('|');
      query = query.or(`purchase_date.lt.${cursorDate},and(purchase_date.eq.${cursorDate},raffle_id.lt.${cursorId})`);
    }

    query = query.order('purchase_date', { ascending: false })
                 .order('raffle_id', { ascending: false })
                 .limit(limit + 1); // Fetch one extra for next cursor

    const { data: rawRows, error } = await query;

    if (error) {
      console.error('[my-tickets-get] Query error:', error);
      return new Response(
        JSON.stringify({ ok: false, error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rows = (rawRows || []) as TicketRow[];
    console.log(`[my-tickets-get] Raw rows fetched: ${rows.length}`);

    // Security check - all rows should belong to the authenticated user
    const invalidRows = rows.filter(row => row.buyer_user_id !== user.id);
    if (invalidRows.length > 0) {
      console.error(`[my-tickets-get] Security violation: ${invalidRows.length} rows don't belong to user ${user.id}`);
      return new Response(
        JSON.stringify({ ok: false, error: 'Security violation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Determine if there are more pages
    const hasMore = rows.length > limit;
    const dataRows = hasMore ? rows.slice(0, limit) : rows;

    // Consolidate by raffle
    const consolidated = consolidateByRaffle(dataRows);
    
    // Sort consolidated results by purchase date desc
    consolidated.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    // Generate next cursor
    let nextCursor = null;
    if (hasMore && consolidated.length > 0) {
      const lastItem = consolidated[consolidated.length - 1];
      nextCursor = `${lastItem.purchaseDate}|${lastItem.raffleId}`;
    }

    const response = {
      ok: true,
      items: consolidated,
      nextCursor,
      debug: {
        source: 'view:my_tickets_ext_v6',
        rowsScanned: dataRows.length,
        consolidated: consolidated.length,
        hasMore
      }
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    )

  } catch (error) {
    console.error('[my-tickets-get] Unexpected error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

serve(withCORS(handler))
