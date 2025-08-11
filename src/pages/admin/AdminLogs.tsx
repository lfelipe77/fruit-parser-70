import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Search, FileText, RefreshCw, Activity, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, subHours } from "date-fns";
import AdminSecurityBanner from "@/components/AdminSecurityBanner";

interface AdminLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  context: any;
  created_at: string;
}

interface DashboardStats {
  logsLast24h: number;
  logsLastWeek: number;
  topActions: { action: string; count: number }[];
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<AdminLogEntry[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    logsLast24h: 0,
    logsLastWeek: 0,
    topActions: []
  });

  const fetchDashboardStats = async () => {
    try {
      const now = new Date();
      const last24h = subHours(now, 24);
      const lastWeek = subDays(now, 7);

      const sb = supabase as any;
      // Get logs from last 24h
      const { data: last24hLogs, error: error24h } = await sb
        .from('admin_log_view')
        .select('*')
        .gte('created_at', last24h.toISOString());

      // Get logs from last week
      const { data: lastWeekLogs, error: errorWeek } = await sb
        .from('admin_log_view')
        .select('*')
        .gte('created_at', lastWeek.toISOString());

      // Get all logs for top actions
      const { data: allLogs, error: errorAll } = await sb
        .from('admin_log_view')
        .select('action');

      if (error24h || errorWeek || errorAll) {
        console.error('Error fetching dashboard stats:', { error24h, errorWeek, errorAll });
        return;
      }

      // Calculate top actions
      const actionCounts: { [key: string]: number } = {};
      (allLogs || []).forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });

      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setDashboardStats({
        logsLast24h: last24hLogs?.length || 0,
        logsLastWeek: lastWeekLogs?.length || 0,
        topActions
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_admin_logs', { p_limit: 5 } as any);
      if (error) throw error;
      console.log('Test logs:', data);

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id ?? null,
        action: row.action,
        context: row.context ?? (row.details ? { details: row.details } : null),
        created_at: row.created_at,
      })) as AdminLogEntry[];
      setLogs(mapped);
      setFilteredLogs(mapped);
      
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user_id && log.user_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.context && JSON.stringify(log.context).toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLogs(filtered);
    }
  }, [searchTerm, logs]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss");
  };

  const formatContext = (context: any) => {
    if (!context) return '-';
    
    // Format as readable JSON with proper indentation
    try {
      return JSON.stringify(context, null, 2);
    } catch (error) {
      return String(context);
    }
  };

  const ContextDisplay = ({ context }: { context: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!context) return <span className="text-muted-foreground">-</span>;
    
    const contextStr = formatContext(context);
    const isLongContext = contextStr.length > 50;
    
    return (
      <div>
        {isLongContext ? (
          <div>
            <div className="text-sm">
              {isExpanded ? (
                <pre className="whitespace-pre-wrap text-xs bg-muted p-2 rounded">
                  {contextStr}
                </pre>
              ) : (
                <span>{contextStr.substring(0, 50)}...</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs mt-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        ) : (
          <span className="text-sm">{contextStr}</span>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminSecurityBanner />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Log de Auditoria
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualização completa das ações realizadas no sistema pelos usuários
            </p>
          </div>
          
          <Button onClick={() => { fetchLogs(); fetchDashboardStats(); }} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Buscar por ação ou ID do usuário</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Digite para buscar ação ou user_id..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-slate-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-700">{dashboardStats.logsLast24h}</div>
                  <div className="text-sm text-slate-600">Últimas 24h</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-700">{dashboardStats.logsLastWeek}</div>
                  <div className="text-sm text-green-600">Última semana</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Actions */}
          {dashboardStats.topActions.slice(0, 3).map((actionData, index) => (
            <Card key={actionData.action} className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xl font-bold text-blue-700">{actionData.count}</div>
                    <div className="text-sm text-blue-600 truncate" title={actionData.action}>
                      {actionData.action}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{filteredLogs.length}</div>
                <div className="text-sm text-muted-foreground">Total de Logs</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(filteredLogs.filter(log => log.user_id).map(log => log.user_id)).size}
                </div>
                <div className="text-sm text-muted-foreground">Usuários Únicos</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {new Set(filteredLogs.map(log => log.action)).size}
                </div>
                <div className="text-sm text-muted-foreground">Tipos de Ação</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredLogs.filter(log => {
                    const logDate = new Date(log.created_at);
                    const today = new Date();
                    return logDate.toDateString() === today.toDateString();
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Hoje</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Registros de Auditoria ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum log encontrado para o filtro aplicado.' : 'Nenhum log encontrado.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>ID do Usuário</TableHead>
                      <TableHead>Contexto</TableHead>
                      <TableHead>ID do Log</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {log.action}
                          </code>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.user_id ? `${log.user_id.substring(0, 8)}...` : 'Sistema'}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <ContextDisplay context={log.context} />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.id.substring(0, 8)}...
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}