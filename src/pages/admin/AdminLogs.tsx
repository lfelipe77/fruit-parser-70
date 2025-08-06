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
import { Calendar, Search, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface AdminLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  context: any;
  created_at: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<AdminLogEntry[]>([]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Use uma consulta SQL direta para acessar a admin_log_view
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, user_id, action, context, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching logs:', error);
        toast.error('Erro ao carregar logs');
        return;
      }

      setLogs(data || []);
      setFilteredLogs(data || []);
      
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
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
          
          <Button onClick={fetchLogs} variant="outline" disabled={loading}>
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