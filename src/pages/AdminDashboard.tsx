import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Users,
  Ban,
  CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardStats {
  rafflesCreatedToday: number;
  loginFailures24h: number;
  auditActions24h: number;
}

interface TopAction {
  action: string;
  count: number;
}

interface AuditAction {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  context: any;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    rafflesCreatedToday: 0,
    loginFailures24h: 0,
    auditActions24h: 0
  });
  const [topActions, setTopActions] = useState<TopAction[]>([]);
  const [recentActions, setRecentActions] = useState<AuditAction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userRole, setUserRole] = useState<string>("");

  // Verificar se é admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Error checking user role:", error);
          return;
        }
        
        setUserRole(data?.role || "");
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    };

    checkAdminRole();
  }, [user]);

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || userRole !== "admin") return;
      
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchTopActions(),
          fetchRecentActions()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Erro ao carregar dados do painel");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, userRole, selectedDate]);

  const fetchStats = async () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    const yesterday = format(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
    
    // Rifas criadas hoje
    const { data: rafflesData, error: rafflesError } = await supabase
      .from("raffles")
      .select("id")
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59`);

    // Falhas de login nas últimas 24h
    const { data: loginFailuresData, error: loginError } = await supabase
      .from("rate_limit_attempts")
      .select("id, ip_address")
      .eq("action", "login_attempt")
      .gte("created_at", yesterday);

    // Total de ações de auditoria nas últimas 24h
    const { data: auditData, error: auditError } = await supabase
      .from("admin_log_view")
      .select("id")
      .gte("created_at", yesterday);

    if (rafflesError) console.error("Error fetching raffles:", rafflesError);
    if (loginError) console.error("Error fetching login failures:", loginError);
    if (auditError) console.error("Error fetching audit data:", auditError);

    setStats({
      rafflesCreatedToday: rafflesData?.length || 0,
      loginFailures24h: loginFailuresData?.length || 0,
      auditActions24h: auditData?.length || 0
    });
  };

  const fetchTopActions = async () => {
    const yesterday = format(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss");
    
    const { data, error } = await supabase
      .from("admin_log_view")
      .select("action")
      .gte("created_at", yesterday);

    if (error) {
      console.error("Error fetching top actions:", error);
      return;
    }

    // Agrupar por ação e contar
    const actionCounts: Record<string, number> = {};
    data?.forEach(item => {
      if (item.action) {
        actionCounts[item.action] = (actionCounts[item.action] || 0) + 1;
      }
    });

    // Converter para array e ordenar
    const sortedActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopActions(sortedActions);
  };

  const fetchRecentActions = async () => {
    const { data, error } = await supabase
      .from("admin_log_view")
      .select("id, created_at, user_id, action, context")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching recent actions:", error);
      return;
    }

    setRecentActions(data || []);
  };

  // Redirecionar se não for admin
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (userRole && userRole !== "admin") {
    return <Navigate to="/access-denied" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel de Administração</h1>
              <p className="text-muted-foreground">Monitore atividades e métricas do sistema</p>
            </div>
            
            {/* Filtro de Data */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Criadas Hoje</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.rafflesCreatedToday}</div>
              <p className="text-xs text-muted-foreground">
                Novas rifas em {format(selectedDate, "dd/MM/yyyy")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhas de Login (24h)</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.loginFailures24h}</div>
              <p className="text-xs text-muted-foreground">
                Tentativas bloqueadas nas últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ações de Auditoria (24h)</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.auditActions24h}</div>
              <p className="text-xs text-muted-foreground">
                Total de ações registradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Top Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top 5 Ações Mais Comuns (24h)
            </CardTitle>
            <CardDescription>
              Ações mais frequentes registradas no sistema nas últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topActions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="action" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Ações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Ações Recentes
            </CardTitle>
            <CardDescription>
              Últimas 50 ações registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Contexto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(action.created_at), "dd/MM/yy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {action.user_id?.slice(0, 8)}...
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {action.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {action.context ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Contexto da Ação</DialogTitle>
                                <DialogDescription>
                                  Detalhes da ação: {action.action}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="h-[400px]">
                                <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                                  {JSON.stringify(action.context, null, 2)}
                                </pre>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}