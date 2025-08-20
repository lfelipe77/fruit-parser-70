import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User } from "lucide-react";
import { Link } from "react-router-dom";

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

function dedupeByTxId(arr: Row[] | null | undefined): Row[] {
  const map = new Map<string, Row>();
  for (const r of arr || []) {
    if (r?.transaction_id) map.set(r.transaction_id, r);
  }
  return Array.from(map.values());
}

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // guard against accidental double run
  const fetched = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (fetched.current) return;
    fetched.current = true;

    let alive = true;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("my_tickets_ext_v2" as any)
        .select("*")
        .order("progress_pct_money", { ascending: false })
        .order("amount_raised", { ascending: false })
        .order("purchase_date", { ascending: false });

      if (error) {
        console.error("[MyTickets] fetch error", error);
      }

      const unique = dedupeByTxId(data as any);
      if (alive) {
        // REPLACE (don't append)
        setRows(unique);
        setLoading(false);
        console.log(
          `[MyTickets] fetched=${(data as any[] | null)?.length ?? 0} unique=${unique.length}`
        );
      }
    })();

    return () => {
      alive = false;
    };
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

  const visible = useMemo(() => (showAll ? rows : rows.slice(0, 10)), [rows, showAll]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Meus Tickets</h1>
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
          Você ainda não possui tickets.
        </div>
      )}

      {/* SINGLE render path: only map 'visible' */}
      <div className="space-y-4">
        {visible.map((r) => (
          <MyTicketCard key={r.transaction_id} row={r} />
        ))}
      </div>

      {!loading && rows.length > 10 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
          >
            {showAll ? "Ver menos" : `Ver todos (${rows.length})`}
          </button>
        </div>
      )}
    </div>
  );
}