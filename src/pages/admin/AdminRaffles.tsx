import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GanhavelEditor } from "@/components/admin/GanhavelEditor";
import type { GanhavelRow } from "@/types/ganhaveis";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AdminRaffles() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [rows, setRows] = useState<GanhavelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GanhavelRow | null>(null);

  // Load ganhaveis with financial data
  const loadGanhaveis = async () => {
    setLoading(true);
    try {
      // Get both base data and financial overview
      const { data: baseData, error: baseError } = await supabase
        .from("ganhaveis")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(200);

      if (baseError) throw baseError;

      // Get financial data from the money view
      const { data: moneyData, error: moneyError } = await supabase
        .from("raffles_public_money_ext")
        .select("id, amount_raised, goal_amount, progress_pct_money");

      if (moneyError) {
        console.warn("Could not load financial data:", moneyError);
      }

      // Merge the data
      const combined = (baseData as GanhavelRow[]).map(row => {
        const money = moneyData?.find(m => m.id === row.id);
        return {
          ...row,
          raised_amount: money?.amount_raised || 0,
          goal_amount: money?.goal_amount || row.goal_amount,
        };
      });

      setRows(combined);
    } catch (error) {
      console.error("Error loading ganhaveis:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar ganháveis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGanhaveis();
  }, []);

  // Auto-open with ?edit=<id>
  useEffect(() => {
    const id = searchParams.get("edit");
    if (!id || !rows.length) return;
    const row = rows.find(r => r.id === id) || null;
    if (row) {
      setEditing(row);
      setOpen(true);
    }
  }, [searchParams, rows]);

  const handleEdit = (row: GanhavelRow) => {
    setEditing(row);
    setOpen(true);
  };

  const handleSaved = (saved: GanhavelRow) => {
    setRows(prev => {
      const ix = prev.findIndex(p => p.id === saved.id);
      if (ix >= 0) {
        const copy = prev.slice();
        copy[ix] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setOpen(false);
    setEditing(null);
    // Reload to get fresh financial data
    loadGanhaveis();
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const fmtBRL = (v: number | null | undefined) => {
    if (typeof v !== "number") return "R$ 0,00";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ganháveis (Admin)</h1>
        <button
          className="rounded-lg border px-4 py-2 hover:bg-primary/10"
          onClick={() => setOpen(true)}
        >
          Novo Ganhável
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div>Carregando…</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map(r => (
            <div key={r.id} className="border rounded-xl p-4 bg-card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-lg">{r.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  r.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                  r.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {r.status}
                </span>
              </div>
              
              {r.image_url && (
                <img 
                  src={r.image_url} 
                  alt={r.title} 
                  className="mt-3 h-32 w-full object-cover rounded" 
                />
              )}
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Meta:</span>
                  <span className="font-medium">{fmtBRL(r.goal_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Arrecadado:</span>
                  <span className="font-medium text-primary">{fmtBRL(r.raised_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket:</span>
                  <span className="font-medium">{fmtBRL(r.ticket_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Bilhetes:</span>
                  <span className="font-medium">{r.total_tickets ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vendidos:</span>
                  <span className="font-medium">{r.sold_tickets ?? 0}</span>
                </div>
              </div>
              
              <button
                className="mt-4 w-full rounded-lg border px-3 py-2 hover:bg-primary/10 transition-colors"
                onClick={() => handleEdit(r)}
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      )}

      <GanhavelEditor
        open={open}
        row={editing}
        onClose={handleClose}
        onSaved={handleSaved}
      />
    </div>
  );
}