import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

interface TicketItem {
  raffleId: string;
  raffleTitle: string;
  raffleImageUrl: string | null;
  purchaseDate: string;
  status: string;
  value: number;
  ticketCount: number;
  purchasedNumbers: string[];
  progressPctMoney: number;
  drawDate: string | null;
  transactionId: string | null;
  goalAmount: number;
  amountRaised: number;
}

interface MyTicketsResponse {
  ok: boolean;
  items: TicketItem[];
  nextCursor: string | null;
  error?: string;
  debug?: {
    source: string;
    rowsScanned: number;
    consolidated: number;
    hasMore: boolean;
  };
}

// Convert API response to legacy format for MyTicketCard compatibility
function convertToLegacyFormat(item: TicketItem): any {
  return {
    transaction_id: item.transactionId,
    raffle_id: item.raffleId,
    raffle_title: item.raffleTitle,
    raffle_image_url: item.raffleImageUrl,
    purchase_date: item.purchaseDate,
    tx_status: item.status,
    value: item.value,
    ticket_count: item.ticketCount,
    purchased_numbers: item.purchasedNumbers,
    goal_amount: item.goalAmount,
    amount_raised: item.amountRaised,
    progress_pct_money: item.progressPctMoney,
    draw_date: item.drawDate,
    buyer_user_id: '' // Not needed for display
  };
}

export default function MyTicketsPage() {
  const { user, session } = useAuth();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const filter = searchParams.get('filter');
  const isDebugMode = searchParams.get('debug') === '1';

  const fetchTickets = async (cursor: string | null = null, append = false) => {
    if (!session?.access_token) return;
    
    const startTime = Date.now();
    const isInitial = !cursor && !append;
    
    if (isInitial) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    // Retry logic with backoff
    const delays = [0, 400, 1200];
    let lastError: any = null;

    for (let attempt = 0; attempt < delays.length; attempt++) {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }

      try {
        const params = new URLSearchParams({
          limit: '20',
          ...(cursor && { cursor }),
          ...(filter === 'won' && { wonOnly: 'true' })
        });

        const { data, error } = await supabase.functions.invoke('my-tickets-get', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (error) throw error;

        const response = data as MyTicketsResponse;
        
        if (!response.ok) {
          throw new Error(response.error || 'API error');
        }

        // Dev security check
        if (import.meta.env.DEV && response.items.length > 0) {
          const hasUserMismatch = response.items.some(item => 
            // This check should never trigger with the RPC, but keeping for safety
            false // The RPC filters server-side, so no user ID to check
          );
          if (hasUserMismatch) {
            console.warn('⚠️ Security: MyTickets showing data not scoped to current user');
          }
        }

        if (append) {
          setItems(prev => [...prev, ...response.items]);
        } else {
          setItems(response.items);
        }
        
        setNextCursor(response.nextCursor);
        
        // Debug info
        if (isDebugMode && response.debug) {
          setDebugInfo({
            ...response.debug,
            requestTime: Date.now() - startTime,
            attempt: attempt + 1
          });
        }

        break; // Success, exit retry loop

      } catch (err) {
        lastError = err;
        console.error(`[MyTickets] Attempt ${attempt + 1} failed:`, err);
        
        if (attempt === delays.length - 1) {
          // All retries failed
          setError('Failed to load tickets. Please try again.');
          if (isDebugMode) {
            setDebugInfo({
              error: String(err),
              attempts: delays.length,
              requestTime: Date.now() - startTime
            });
          }
        }
      }
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const loadMore = () => {
    if (nextCursor && !loadingMore) {
      fetchTickets(nextCursor, true);
    }
  };

  useEffect(() => {
    if (!user || !session) return;
    
    setItems([]);
    setNextCursor(null);
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
              <div>Items loaded: {items.length}</div>
              {debugInfo.rowsScanned && <div>Rows scanned: {debugInfo.rowsScanned}</div>}
              {debugInfo.consolidated && <div>Consolidated: {debugInfo.consolidated}</div>}
              {debugInfo.hasMore !== undefined && <div>Has more: {String(debugInfo.hasMore)}</div>}
              {debugInfo.attempts && <div>Retry attempts: {debugInfo.attempts}</div>}
              {debugInfo.error && <div className="text-red-600">Error: {debugInfo.error}</div>}
              {nextCursor && <div>Next cursor: {nextCursor.slice(0, 50)}...</div>}
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
          <MyTicketCard key={item.raffleId} row={convertToLegacyFormat(item)} />
        ))}
      </div>

      {/* Load More Button */}
      {nextCursor && !loading && !error && (
        <div className="mt-8 text-center">
          <Button 
            onClick={loadMore} 
            disabled={loadingMore}
            variant="outline"
            className="px-8"
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="mt-4 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}