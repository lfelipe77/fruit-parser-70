import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User, AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

type Row = {
  transaction_id: string;
  raffle_id: string;
  raffle_title: string;
  raffle_image_url: string | null;
  purchase_date: string;
  tx_status: string;
  value: number;
  ticket_count: number;
  purchased_numbers: any;
  goal_amount: number;
  amount_raised: number;
  progress_pct_money: number;
  draw_date?: string | null;
  winner_ticket_id?: string | null;
  buyer_user_id: string;
};

// Aggregate multiple transactions for the same raffle into one display card
function consolidateByRaffle(rows: Row[]): Row[] {
  const raffleMap = new Map<string, Row>();
  
  for (const row of rows) {
    const existing = raffleMap.get(row.raffle_id);
    
    if (!existing) {
      // First transaction for this raffle
      raffleMap.set(row.raffle_id, { ...row });
    } else {
      // Merge with existing transaction for same raffle
      existing.value += row.value; // Sum total spent
      existing.ticket_count += row.ticket_count; // Sum ticket count
      
      // Merge purchased numbers arrays
      const existingNumbers = Array.isArray(existing.purchased_numbers) ? existing.purchased_numbers : [];
      const newNumbers = Array.isArray(row.purchased_numbers) ? row.purchased_numbers : [];
      existing.purchased_numbers = [...existingNumbers, ...newNumbers];
      
      // Keep the most recent purchase date
      if (new Date(row.purchase_date) > new Date(existing.purchase_date)) {
        existing.purchase_date = row.purchase_date;
        existing.tx_status = row.tx_status;
        existing.transaction_id = row.transaction_id; // Use most recent transaction ID
      }
    }
  }
  
  return Array.from(raffleMap.values());
}

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSecurityBanner, setShowSecurityBanner] = useState(false);
  
  const filter = searchParams.get('filter');

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    (async () => {
      setLoading(true);
      
      // Build query with proper user scoping + resilient fallback across view versions
      const fetchFromView = async (viewName: string) => {
        let q = supabase
          .from(viewName as any)
          .select("*")
          .eq('buyer_user_id', user.id)
          .order("purchase_date", { ascending: false });
        // Note: 'won' filter applied client-side to avoid schema drift across views
        return await q;
      };

      let data: any[] | null = null;
      let error: any = null;

      // Try latest view first, then fall back
      const attempts = ["my_tickets_ext_v6", "my_tickets_ext_v5", "my_tickets_ext_v3"];
      for (const v of attempts) {
        const res = await fetchFromView(v);
        if (!res.error && (res.data?.length ?? 0) >= 0) {
          data = res.data as any[];
          error = res.error;
          if ((data?.length ?? 0) > 0 || v === attempts[attempts.length - 1]) {
            console.log("[MyTickets] Using view:", v, "rows:", data?.length || 0);
            break;
          }
        } else {
          error = res.error;
        }
      }

      if (error) {
        console.error("[MyTickets] fetch error", error);
      }
      
      console.log("[MyTickets] Debug:", {
        userExists: !!user,
        userId: user?.id,
        dataLength: data?.length || 0,
        error: error,
        rawData: data
      });
      
      if (mounted) {
        const rawRows = (data as unknown as Row[]) ?? [];
        
        // Dev security check - warn if data scope is incorrect
        if (import.meta.env.DEV && rawRows.length > 0) {
          const firstRow = rawRows[0];
          if (firstRow.buyer_user_id !== user.id) {
            console.warn('⚠️ Security: MyTickets showing data not scoped to current user');
            setShowSecurityBanner(true);
          }
        }
        
        // Apply 'won' filter client-side for compatibility across views
        const filtered = filter === 'won' ? rawRows.filter(r => !!r.winner_ticket_id) : rawRows;
        // Consolidate multiple transactions per raffle into single cards
        const consolidatedRows = consolidateByRaffle(filtered);
        setRows(consolidatedRows);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, filter]);

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
      {/* Dev Security Banner */}
      {showSecurityBanner && import.meta.env.DEV && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div className="text-red-800">
            <strong>⚠️ Escopo incorreto:</strong> esta lista não está filtrada pelo usuário.
          </div>
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

      {!loading && rows.length === 0 && (
        <div className="text-center text-gray-600 py-16">
          {filter === 'won' 
            ? 'Você ainda não ganhou nenhum ganhável.'
            : 'Você ainda não possui tickets.'
          }
        </div>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <MyTicketCard key={r.raffle_id} row={r} />
        ))}
      </div>
    </div>
  );
}