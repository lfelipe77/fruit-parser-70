import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

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
  const filter = searchParams.get('filter');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("my_tickets_ext_v6" as any)
        .select("*")
        .eq('buyer_user_id', user.id)
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("[MyTickets] fetch error", error);
      }
      
      if (mounted) {
        const rawRows = (data as unknown as Row[]) ?? [];
        // Consolidate multiple transactions per raffle into single cards
        const consolidatedRows = consolidateByRaffle(rawRows);
        setRows(consolidatedRows);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <div className="text-center text-gray-600 py-16">
          Faça login para ver seus tickets.
        </div>
      </div>
    );
  }

  // Filter rows based on URL parameter
  const filteredRows = filter === 'won' 
    ? rows.filter(row => row.winner_ticket_id) 
    : rows;

  const pageTitle = filter === 'won' ? 'Ganhaveis que Ganhei' : 'Meus Bilhetes';

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Ticket className="w-6 h-6 text-primary" />
              {pageTitle}
            </h1>
            {filter === 'won' && (
              <Badge variant="secondary" className="mt-1">
                🏆 Apenas ganhaveis que você ganhou
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Carregando seus bilhetes...</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'won' ? 'Nenhum ganhavel ganho ainda' : 'Nenhum bilhete encontrado'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'won' 
              ? 'Quando você ganhar algum ganhavel, ele aparecerá aqui.'
              : 'Comece participando dos ganhaveis para ver seus bilhetes aqui.'
            }
          </p>
          <Button asChild>
            <Link to="/raffles">Explorar Ganhaveis</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((row) => (
            <MyTicketCard key={`${row.raffle_id}-${row.transaction_id}`} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
