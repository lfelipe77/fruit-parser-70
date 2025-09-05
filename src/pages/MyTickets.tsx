import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

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
  transaction_id: string | null;
  goal_amount: number;
  amount_raised: number;
  buyer_user_id: string;
}

// Utility functions
const flattenCombos = (blob: any): string[] => {
  const arr = Array.isArray(blob) ? blob.flat(2) : [];
  return arr
    .filter(x => typeof x === 'string' && x.trim().length)
    .filter((v, i, a) => a.indexOf(v) === i);
};

const mapStatus = (status: string): string => {
  const normalized = status?.toLowerCase();
  if (['paid', 'refunded', 'failed', 'settled'].includes(normalized)) {
    return normalized;
  }
  return 'pending';
};

async function withBackoff<T>(fn: () => Promise<T>) {
  const delays = [0, 400, 1200];
  let lastErr;
  for (const d of delays) {
    if (d) await new Promise(r => setTimeout(r, d));
    try { return await fn(); } catch (e) { lastErr = e; }
  }
  throw lastErr;
}

// Convert v7 row to legacy format for MyTicketCard compatibility
function convertToLegacyFormat(row: TicketRow): any {
  return {
    transaction_id: row.transaction_id,
    raffle_id: row.raffle_id,
    raffle_title: row.raffle_title,
    raffle_image_url: row.raffle_image_url,
    purchase_date: row.purchase_date,
    tx_status: mapStatus(row.tx_status),
    value: row.value,
    ticket_count: row.ticket_count,
    purchased_numbers: row.purchased_numbers, // Keep original structure for MyTicketCard
    goal_amount: row.goal_amount,
    amount_raised: row.amount_raised,
    progress_pct_money: Math.min(100, Math.max(0, Number(row.progress_pct_money) || 0)),
    draw_date: row.draw_date,
    buyer_user_id: ''
  };
}

export default function MyTicketsPage() {
  const { user, session } = useAuth();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const filter = searchParams.get('filter');
  const isDebugMode = searchParams.get('debug') === '1';

  const fetchV7 = async () => {
    if (!user?.id) throw new Error('No user ID');
    
    // Query my_tickets_ext_v7 directly
    const { data, error } = await supabase
      .from('my_tickets_ext_v7' as any)
      .select('*')
      .eq('buyer_user_id', user.id)
      .order('purchase_date', { ascending: false })
      .limit(50);

    return { data: data as unknown as TicketRow[] | null, error };
  };

  const fetchTickets = async () => {
    if (!user?.id) return;
    
    const startTime = Date.now();
    setLoading(true);
    setError(null);

    try {
      const { data: rows, error } = await withBackoff(fetchV7);
      
      if (error) throw error;

      // Dev security check
      if (import.meta.env.DEV && rows && rows.length > 0) {
        const hasUserMismatch = rows.some(row => row.buyer_user_id !== user.id);
        if (hasUserMismatch) {
          console.warn('⚠️ Security: MyTickets showing data not scoped to current user');
        }
      }

      // Apply won filter client-side for now
      let filteredRows = rows || [];
      if (filter === 'won') {
        // For now, we'll skip the won filter since the structure isn't clear
        // In a real implementation, this would check for winning status
      }

      setItems(filteredRows);
      
      // Debug info
      if (isDebugMode) {
        const statusHistogram: Record<string, number> = {};
        let zeroTicketsWithNumbers = 0;
        
        filteredRows.forEach(row => {
          const status = mapStatus(row.tx_status);
          statusHistogram[status] = (statusHistogram[status] || 0) + 1;
          
          if (row.ticket_count === 0 && flattenCombos(row.purchased_numbers).length > 0) {
            zeroTicketsWithNumbers++;
          }
        });

        setDebugInfo({
          source: 'view:my_tickets_ext_v7',
          count: filteredRows.length,
          firstPurchaseDate: filteredRows[0]?.purchase_date || null,
          lastPurchaseDate: filteredRows[filteredRows.length - 1]?.purchase_date || null,
          statusHistogram,
          zeroTicketsWithNumbers,
          requestTime: Date.now() - startTime
        });
      }

    } catch (err) {
      console.error('[MyTickets] Failed to load:', err);
      setError('Failed to load tickets. Please try again.');
      
      if (isDebugMode) {
        setDebugInfo({
          error: String(err),
          requestTime: Date.now() - startTime
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !session) return;
    
    setItems([]);
    fetchTickets();
  }, [user, session, filter]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <div className="text-center text-gray-600 py-16">
          Faça login para ver seus tickets.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      {/* Debug Panel */}
      {isDebugMode && (
        <div className="mb-4 bg-gray-50 border rounded-lg p-4">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {showDebug ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Debug Info
          </button>
          {showDebug && debugInfo && (
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <div>Source: {debugInfo.source}</div>
              <div>Request time: {debugInfo.requestTime}ms</div>
              <div>Count: {debugInfo.count}</div>
              {debugInfo.firstPurchaseDate && <div>First: {debugInfo.firstPurchaseDate}</div>}
              {debugInfo.lastPurchaseDate && <div>Last: {debugInfo.lastPurchaseDate}</div>}
              {debugInfo.statusHistogram && (
                <div>Status: {JSON.stringify(debugInfo.statusHistogram)}</div>
              )}
              {debugInfo.zeroTicketsWithNumbers > 0 && (
                <div className="text-orange-600">
                  ⚠️ {debugInfo.zeroTicketsWithNumbers} items with 0 tickets but have numbers
                </div>
              )}
              {debugInfo.error && <div className="text-red-600">Error: {debugInfo.error}</div>}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {filter === 'won' ? 'Ganháveis que Ganhei' : 'Meus Tickets'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Início
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/descobrir" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Descobrir
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-center text-red-600 py-16 bg-red-50 rounded-lg">
          {error}
          <button 
            onClick={() => fetchTickets()} 
            className="block mx-auto mt-2 text-sm text-red-700 hover:text-red-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center text-gray-600 py-16">
          {filter === 'won' 
            ? 'Você ainda não ganhou nenhum ganhável.'
            : 'Você ainda não possui tickets.'
          }
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => (
          <MyTicketCard key={item.raffle_id} row={convertToLegacyFormat(item)} />
        ))}
      </div>
    </div>
  );
}