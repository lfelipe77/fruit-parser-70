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
      // Create mock data based on the audit events we know are being logged
      const mockLogs: AdminLogEntry[] = [
        {
          id: '1',
          user_id: 'user123',
          action: 'updated_user_profile',
          context: { page: 'MinhaConta', updated_fields: ['name', 'email'] },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: 'user456',
          action: 'uploaded_raffle_image',
          context: { page: 'LanceSeuGanhavel', filename: 'image.jpg' },
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '3',
          user_id: 'organizer789',
          action: 'marked_ticket_paid',
          context: { page: 'PaginaDaRifa', ticket_id: 'ticket123', organizer_id: 'org456' },
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '4',
          user_id: 'organizer789',
          action: 'updated_raffle_status',
          context: { page: 'PaginaDaRifa', status: 'closed', raffle_id: 'raffle123' },
          created_at: new Date(Date.now() - 10800000).toISOString()
        },
        {
          id: '5',
          user_id: null,
          action: 'launched_new_raffle',
          context: { page: 'LanceSeuGanhavel', raffle_name: 'Smartphone Galaxy S24' },
          created_at: new Date(Date.now() - 14400000).toISOString()
        }
      ];

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      
      toast.success('Logs carregados com sucesso');
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
    
    // Handle common context patterns
    if (typeof context === 'object') {
      return Object.entries(context)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    return String(context);
  };

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('create') || action.includes('upload')) return 'default';
    if (action.includes('update') || action.includes('edit')) return 'secondary';
    if (action.includes('delete') || action.includes('cancel')) return 'destructive';
    if (action.includes('login') || action.includes('auth')) return 'outline';
    return 'secondary';
  };

  const getActionDisplayName = (action: string) => {
    const actionMap: Record<string, string> = {
      'updated_user_profile': 'Perfil Atualizado',
      'uploaded_raffle_image': 'Imagem da Rifa Enviada',
      'marked_ticket_paid': 'Bilhete Marcado como Pago',
      'updated_raffle_status': 'Status da Rifa Atualizado',
      'create_raffle': 'Rifa Criada',
      'update_raffle': 'Rifa Atualizada',
      'ticket_purchase': 'Compra de Bilhete',
      'user_login': 'Login do Usuário',
      'password_change': 'Senha Alterada'
    };
    
    return actionMap[action] || action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Logs de Auditoria
            </h1>
            <p className="text-muted-foreground mt-2">
              Visualização dos eventos e ações registrados no sistema
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
                <Label htmlFor="search">Buscar por ação, usuário ou contexto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Digite para buscar..."
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
              Logs de Auditoria ({filteredLogs.length})
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
                      <TableHead>Usuário</TableHead>
                      <TableHead>Contexto</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {getActionDisplayName(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.user_id ? `${log.user_id.substring(0, 8)}...` : 'Sistema'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <span className="text-sm text-muted-foreground">
                            {formatContext(log.context)}
                          </span>
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