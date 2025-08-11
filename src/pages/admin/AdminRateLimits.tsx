import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Shield } from "lucide-react";

interface RateLimitAttempt {
  id: string;
  created_at: string;
  action: string;
  ip_address: string | null;
}

const PAGE_SIZE = 50;

export default function AdminRateLimits() {
  const [attempts, setAttempts] = useState<RateLimitAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [actionFilter, setActionFilter] = useState<string>("");
  const [ipFilter, setIpFilter] = useState<string>("");
  const [availableActions, setAvailableActions] = useState<string[]>([]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(Math.min(total, 500) / PAGE_SIZE)), [total]);

  const fetchActions = async () => {
    const { data, error } = await supabase
      .from("rate_limit_attempts")
      .select("action")
      .order("action", { ascending: true })
      .limit(1000);
    if (!error) {
      const unique = Array.from(new Set((data || []).map((d: any) => d.action).filter(Boolean)));
      setAvailableActions(unique);
    }
  };

  const fetchAttempts = async () => {
    setLoadingTable(true);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("rate_limit_attempts")
      .select("id, created_at, action, ip_address", { count: "exact" })
      .order("created_at", { ascending: false });

    if (actionFilter) query = query.eq("action", actionFilter);
    if (ipFilter) query = query.ilike("ip_address", `%${ipFilter}%`);

    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error("Error loading rate limit attempts:", error);
    } else {
      setAttempts((data as RateLimitAttempt[]) || []);
      setTotal(count || 0);
    }
    setLoadingTable(false);
  };

  useEffect(() => {
    // initial data
    (async () => {
      setLoading(true);
      await fetchActions();
      await fetchAttempts();
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // refetch on page/filter change
    fetchAttempts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter]);

  const onApplyFilters = () => {
    setPage(1);
    fetchAttempts();
  };

  return (
    <div className="space-y-6">
      <div className="border-b bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Rate Limits</h1>
                <p className="text-sm text-muted-foreground">Tentativas registradas (últimas 500, mais recentes primeiro)</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => fetchAttempts()} disabled={loadingTable}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingTable ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar</CardTitle>
          <CardDescription>Filtre por ação e IP. Paginação de 50 por página.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Ação</label>
            <Select value={actionFilter} onValueChange={(v) => setActionFilter(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {availableActions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-muted-foreground">IP contém</label>
            <Input value={ipFilter} onChange={(e) => setIpFilter(e.target.value)} placeholder="ex: 192.168" className="mt-1" />
          </div>

          <div className="flex items-end">
            <Button onClick={onApplyFilters} disabled={loadingTable}>Aplicar</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros</CardTitle>
          <CardDescription>Somente leitura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading || loadingTable ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Carregando…</TableCell>
                  </TableRow>
                ) : attempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell>
                  </TableRow>
                ) : (
                  attempts.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-sm">{new Date(r.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{r.action}</TableCell>
                      <TableCell className="font-mono text-xs">{r.ip_address || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages} • {Math.min(total, 500)} registros
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loadingTable}>Anterior</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loadingTable}>Próxima</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
