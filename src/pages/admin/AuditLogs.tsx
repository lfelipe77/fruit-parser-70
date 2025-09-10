import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Download, Calendar, Shield, Activity } from "lucide-react";

interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string | null;
  context: any | null;
  created_at: string | null;
}

export default function AuditLogs() {
  const [limit, setLimit] = useState<number>(100);
  const [minutes, setMinutes] = useState<number>(1440); // 24 hours
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)("get_audit_logs_recent", {
        p_limit: Math.max(1, Math.min(1000, limit)),
        p_minutes: Math.max(1, minutes),
        p_action: actionFilter || null,
      });

      if (error) {
        const msg = String(error?.message || "Erro ao buscar logs");
        if (msg.toLowerCase().includes("admin only") || msg.toLowerCase().includes("access denied")) {
          toast({ title: "Acesso negado", description: "Você deve ser admin para ver os logs de auditoria.", variant: "destructive" });
        } else {
          toast({ title: "Erro", description: msg, variant: "destructive" });
        }
        return;
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = String(err?.message || err || "Erro inesperado");
      if (msg.toLowerCase().includes("admin only") || msg.toLowerCase().includes("access denied")) {
        toast({ title: "Acesso negado", description: "Você deve ser admin para ver os logs de auditoria.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const onAdminPing = async () => {
    setPingLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)("admin_ping");
      if (error) {
        throw error;
      }
      toast({ title: "Sucesso", description: String(data ?? "ok") });
    } catch (err: any) {
      const msg = String(err?.message || err || "Erro inesperado");
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setPingLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    if (!searchTerm) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row => 
      row.action?.toLowerCase().includes(term) ||
      row.user_id?.toLowerCase().includes(term) ||
      JSON.stringify(row.context || {}).toLowerCase().includes(term)
    );
  }, [rows, searchTerm]);

  const getActionBadge = (action: string | null) => {
    if (!action) return null;
    
    const actionLower = action.toLowerCase();
    if (actionLower.includes('admin') || actionLower.includes('role_change')) {
      return <Badge variant="destructive" className="text-xs">Admin</Badge>;
    }
    if (actionLower.includes('payment') || actionLower.includes('transaction')) {
      return <Badge variant="outline" className="text-xs">Payment</Badge>;
    }
    if (actionLower.includes('raffle') || actionLower.includes('ganhavel')) {
      return <Badge variant="secondary" className="text-xs">Raffle</Badge>;
    }
    if (actionLower.includes('auth') || actionLower.includes('login')) {
      return <Badge variant="outline" className="text-xs">Auth</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Other</Badge>;
  };

  const onExportCsv = () => {
    const dataToExport = filteredRows;
    if (!dataToExport?.length) return;
    
    const header = ["id", "action", "user_id", "created_at", "context"];
    const csv = [header.join(",")]
      .concat(
        dataToExport.map((r) => {
          const contextStr = JSON.stringify(r.context ?? {});
          const cols = [r.id, r.action ?? "", r.user_id ?? "", r.created_at ?? "", contextStr];
          return cols
            .map((c) => {
              const s = String(c ?? "");
              // wrap in quotes and escape existing quotes
              return `"${s.replace(/"/g, '""')}"`;
            })
            .join(",");
        })
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-semibold">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">Sistema de auditoria e rastreamento de ações administrativas</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onAdminPing} disabled={pingLoading}>
            {pingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            <Activity className="h-4 w-4 mr-1" />
            Test Connection
          </Button>
        </div>
      </header>

      {/* Enhanced Filters */}
      <section className="bg-card rounded-lg border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filtros e Busca</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label htmlFor="search" className="text-xs font-medium text-muted-foreground">
              Buscar em ações/contexto
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="action-filter" className="text-xs font-medium text-muted-foreground">
              Filtro por ação
            </Label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                <SelectItem value="admin">Admin Actions</SelectItem>
                <SelectItem value="payment">Payment Actions</SelectItem>
                <SelectItem value="raffle">Raffle Actions</SelectItem>
                <SelectItem value="auth">Auth Actions</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="minutes" className="text-xs font-medium text-muted-foreground">
              Últimas (minutos)
            </Label>
            <Select value={minutes.toString()} onValueChange={(v) => setMinutes(Number(v))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="360">6 horas</SelectItem>
                <SelectItem value="1440">24 horas</SelectItem>
                <SelectItem value="4320">3 dias</SelectItem>
                <SelectItem value="10080">1 semana</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="limit" className="text-xs font-medium text-muted-foreground">
              Limite de resultados
            </Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={1000}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-8 text-sm"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Mostrando {filteredRows.length} de {rows.length} registros
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={fetchLogs} disabled={loading} className="h-8">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-3 w-3" />
                  Buscar
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={onExportCsv} disabled={!filteredRows.length} className="h-8">
              <Download className="mr-2 h-3 w-3" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </section>

      {/* Results Table */}
      <section className="bg-card rounded-lg border overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Registros de Auditoria</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Últimos {minutes} minutos
            </div>
          </div>
        </div>
        
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead className="w-40">Evento</TableHead>
                <TableHead className="w-32">Usuário</TableHead>
                <TableHead className="w-36">Data/Hora</TableHead>
                <TableHead>Contexto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredRows.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando registros...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>Nenhum registro encontrado</p>
                        <p className="text-xs">Tente ajustar os filtros ou período de busca</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
              {filteredRows.map((r) => (
                <TableRow key={r.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{r.action ?? "—"}</span>
                      {getActionBadge(r.action)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.user_id ? (
                      <span className="text-primary">{r.user_id.slice(0, 8)}...</span>
                    ) : (
                      <span className="text-muted-foreground italic">anônimo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {r.created_at ? (
                      <div className="space-y-0.5">
                        <div>{new Date(r.created_at).toLocaleDateString('pt-BR')}</div>
                        <div className="text-muted-foreground">{new Date(r.created_at).toLocaleTimeString('pt-BR')}</div>
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <ContextCell value={r.context} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}

function ContextCell({ value }: { value: any }) {
  const [open, setOpen] = useState(false);
  
  const preview = useMemo(() => {
    if (!value || typeof value !== 'object') {
      const str = String(value ?? "—");
      return open ? str : (str.length > 80 ? str.slice(0, 80) + "…" : str);
    }
    
    try {
      const str = JSON.stringify(value, null, open ? 2 : 0);
      if (str === '{}') return "—";
      return open ? str : (str.length > 80 ? str.slice(0, 80) + "…" : str);
    } catch {
      const s = String(value);
      return open ? s : (s.length > 80 ? s.slice(0, 80) + "…" : s);
    }
  }, [value, open]);

  const isEmpty = !value || (typeof value === 'object' && Object.keys(value).length === 0);

  if (isEmpty) {
    return <span className="text-xs text-muted-foreground italic">sem contexto</span>;
  }

  return (
    <div className="max-w-[400px]">
      <pre className={`text-xs whitespace-pre-wrap break-words ${open ? 'bg-muted/50 p-2 rounded' : ''}`}>
        {preview}
      </pre>
      {((typeof value === 'object' && JSON.stringify(value).length > 80) || (typeof value !== 'object' && String(value).length > 80)) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-primary hover:underline mt-1"
        >
          {open ? "↗ Colapsar" : "↘ Expandir JSON"}
        </button>
      )}
    </div>
  );
}
