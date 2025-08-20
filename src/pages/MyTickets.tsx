import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User } from "lucide-react";
import { Link } from "react-router-dom";

type Row = Parameters<typeof MyTicketCard>[0]["row"] & {
  buyer_user_id?: string;
};

function sigOf(r: Row): string {
  return `${r.buyer_user_id || 'unknown'}|${r.raffle_id}|${JSON.stringify(r.purchased_numbers || [])}`;
}

function dedupeBySignature(arr: Row[] | null | undefined): Row[] {
  const map = new Map<string, Row>();
  for (const r of arr || []) {
    const sig = sigOf(r);
    if (!map.has(sig)) map.set(sig, r);
  }
  return Array.from(map.values());
}

export default function MyTicketsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("my_tickets_ext_v6" as any)
          .select("*")
          .order("progress_pct_money", { ascending: false })
          .order("amount_raised", { ascending: false })
          .order("purchase_date", { ascending: false });

        if (error) console.error("[MyTickets] fetch error:", error);

        const unique = dedupeBySignature(data as any);
        if (alive) {
          setRows(unique); // replace, don't append
          setLoading(false);
        }
      } catch (e) {
        console.error("[MyTickets] unexpected:", e);
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  const visible = showAll ? rows : rows.slice(0, 10);

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

      {!loading && rows.length > 0 && (
        <>
          <div className="space-y-4">
            {visible.map((r) => (
              <MyTicketCard key={sigOf(r)} row={r} />
            ))}
          </div>

          {rows.length > 10 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-sm px-3 py-1.5 rounded border hover:bg-gray-50"
              >
                {showAll ? "Ver menos" : `Ver todos (${rows.length})`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}