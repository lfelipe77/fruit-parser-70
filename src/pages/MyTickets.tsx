import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import MyTicketCard from "@/components/MyTicketCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Ticket, User } from "lucide-react";
import { Link } from "react-router-dom";

type Row = Parameters<typeof MyTicketCard>[0]["row"];

function dedupeByTxId(arr: Row[] | null | undefined): Row[] {
  const map = new Map<string, Row>();
  for (const r of arr || []) if (r?.transaction_id) map.set(r.transaction_id, r);
  return Array.from(map.values());
}

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const fetchedOnce = useRef(false);

  useEffect(() => {
    if (!user) return;
    if (fetchedOnce.current) return;
    fetchedOnce.current = true;

    let alive = true;

    async function run() {
      setLoading(true);
      setErrorText(null);

      // helper to fetch from a given view name
      const getFrom = async (view: string) => {
        return supabase
          .from(view as any)
          .select("*")
          .order("progress_pct_money", { ascending: false })
          .order("amount_raised", { ascending: false })
          .order("purchase_date", { ascending: false });
      };

      try {
        // try v2 first
        let { data, error } = await getFrom("my_tickets_ext_v2");

        // if the view doesn't exist, retry with the original view
        if (error && (error as any)?.code === "42P01") {
          console.warn("[MyTickets] v2 view missing, retrying my_tickets_ext");
          ({ data, error } = await getFrom("my_tickets_ext"));
        }

        if (error) {
          console.error("[MyTickets] fetch error:", error);
          if (alive) {
            setErrorText("Não foi possível carregar seus tickets. Tente novamente em instantes.");
            setRows([]);
          }
        } else {
          const unique = dedupeByTxId(data as any);
          if (alive) setRows(unique);
        }
      } catch (e) {
        console.error("[MyTickets] unexpected error:", e);
        if (alive) setErrorText("Houve um erro ao carregar seus tickets.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
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

      {!loading && errorText && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorText}
        </div>
      )}

      {!loading && !errorText && rows.length === 0 && (
        <div className="text-center text-gray-600 py-16">
          Você ainda não possui tickets.
        </div>
      )}

      {!loading && !errorText && rows.length > 0 && (
        <>
          <div className="space-y-4">
            {visible.map((r) => (
              <MyTicketCard key={r.transaction_id} row={r} />
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