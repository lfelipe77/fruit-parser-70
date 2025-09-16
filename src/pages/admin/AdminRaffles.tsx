import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GanhavelEditor } from "@/components/admin/GanhavelEditor";
import type { RaffleRow, RaffleCardInfo } from "@/types/raffles";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export default function AdminRaffles() {
  console.log("[AdminRaffles] Component loading...");
  
  const { toast } = useToast();
  const { logAdminAction } = useAuditLogger();
  const [searchParams] = useSearchParams();

  const [rows, setRows] = useState<RaffleCardInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RaffleRow | null>(null);
  
  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const itemsPerPage = 12;

  // Helper to fetch editable raffle from table
  async function fetchEditableRaffle(id: string): Promise<RaffleRow | null> {
    const { data, error } = await (supabase as any)
      .from("raffles")
      .select("id,user_id,title,description,image_url,goal_amount,ticket_price,category_id,subcategory_id,location_city,location_state,direct_purchase_link,status,created_at,updated_at")
      .eq("id", id)
      .single();
    if (error) {
      console.error("[AdminRaffles] load editable raffle error:", error);
      return null;
    }
    return data as RaffleRow;
  }

  // Load ganhaveis from the view (for dashboard stats)
  const loadGanhaveis = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Use the view for listing with proper money data
      let query = (supabase as any)
        .from("raffles_public_money_ext")
        .select(`
          id,
          title,
          description,
          image_url,
          status,
          ticket_price,
          goal_amount,
          amount_raised,
          progress_pct_money,
          last_paid_at,
          created_at,
          draw_date,
          category_name,
          subcategory_name,
          location_city,
          location_state,
          participants_count,
          direct_purchase_link
        `, { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to);

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike("title", `%${searchTerm.trim()}%`);
      }

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setTotalCount(count || 0);
      setRows(data || []);
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
  }, [searchTerm, statusFilter, toast]);

  useEffect(() => {
    loadGanhaveis(currentPage);
  }, [currentPage, loadGanhaveis]);

  // Auto-open with ?edit=<id>
  useEffect(() => {
    const id = searchParams.get("edit");
    if (!id || !rows.length) return;
    const rowFromView = rows.find(r => r.id === id);
    if (rowFromView) {
      handleEdit(rowFromView);
    }
  }, [searchParams, rows]);

  const handleEdit = async (rowFromView: RaffleCardInfo) => {
    const full = await fetchEditableRaffle(rowFromView.id);
    if (!full) return;
    setEditing(full);
    setOpen(true);
  };

  const handleSaved = (saved: RaffleRow) => {
    // Log admin action
    logAdminAction('raffle_updated', {
      raffle_id: saved.id,
      title: saved.title,
      status: saved.status,
      goal_amount: saved.goal_amount,
      previous_status: editing?.status,
    });

    // Update the list row in memory
    setRows(prev => {
      const ix = prev.findIndex(p => p.id === saved.id);
      if (ix >= 0) {
        const copy = prev.slice();
        // Update with saved data where possible
        copy[ix] = {
          ...copy[ix],
          title: saved.title,
          image_url: saved.image_url,
          status: saved.status,
          ticket_price: saved.ticket_price,
          goal_amount: saved.goal_amount,
          location_city: saved.location_city,
          location_state: saved.location_state,
          direct_purchase_link: saved.direct_purchase_link,
        } as any;
        return copy;
      }
      return prev;
    });
    setOpen(false);
    setEditing(null);
    // Reload to get fresh financial data
    loadGanhaveis(currentPage);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const fmtBRL = (v: number | null | undefined) => {
    if (typeof v !== "number") return "R$ 0,00";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    loadGanhaveis(1);
  }, [loadGanhaveis]);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    // Trigger search with new status
    setTimeout(() => loadGanhaveis(1), 0);
  }, [loadGanhaveis]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ganháveis (Admin)</h1>
        <Button onClick={() => setOpen(true)}>
          Novo Ganhável
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="archived">Arquivados</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Results Info */}
      <div className="text-sm text-muted-foreground mb-4">
        Mostrando {rows.length} de {totalCount} ganháveis
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
                  <span className="font-medium text-primary">{fmtBRL(r.amount_raised)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ticket:</span>
                  <span className="font-medium">{fmtBRL((r as any).ticket_price || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progresso:</span>
                  <span className="font-medium">{r.progress_pct_money ?? 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Participantes:</span>
                  <span className="font-medium">{r.participants_count ?? 0}</span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage >= totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
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