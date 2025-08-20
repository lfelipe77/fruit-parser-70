import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";

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

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("my_tickets_ext" as any)
        .select("*")
        .order("progress_pct_money", { ascending: false })
        .order("amount_raised", { ascending: false })
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("[MyTickets] fetch error", error);
      }
      if (mounted) setRows((data as unknown as Row[]) ?? []);
      setLoading(false);
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

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Meus Tickets</h1>

      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="text-center text-gray-600 py-16">
          Você ainda não possui tickets.
        </div>
      )}

      <div className="space-y-4">
        {rows.map((r) => (
          <MyTicketCard key={r.transaction_id} row={r} />
        ))}
      </div>
    </div>
  );
}