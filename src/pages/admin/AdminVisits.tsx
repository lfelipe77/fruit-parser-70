import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Globe, 
  Eye, 
  Clock,
  TrendingUp,
  Users,
  RefreshCw,
  Monitor,
  Smartphone,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import AdminSecurityBanner from "@/components/AdminSecurityBanner";

interface PublicVisit {
  id: string;
  ip_address: string;
  user_agent?: string;
  url: string;
  pathname?: string;
  referer?: string;
  country?: string;
  city?: string;
  created_at: string;
}

interface VisitStats {
  totalVisitsToday: number;
  totalVisitsWeek: number;
  uniqueIPsToday: number;
  topPages: Array<{ url: string; count: number }>;
  recentVisits: PublicVisit[];
}

export default function AdminVisits() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [stats, setStats] = useState<VisitStats>({
    totalVisitsToday: 0,
    totalVisitsWeek: 0,
    uniqueIPsToday: 0,
    topPages: [],
    recentVisits: []
  });

  const PAGE_SIZE = 50;
  const [loadingTable, setLoadingTable] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState<'all'|'24h'|'7d'|'30d'>('all');
  const [pathFilter, setPathFilter] = useState("");

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

  // Buscar dados das visitas
  useEffect(() => {
    const fetchVisitData = async () => {
      if (!user || userRole !== "admin") return;
      
      setLoading(true);
      try {
        await Promise.all([
          fetchVisitStats(),
          fetchRecentVisits()
        ]);
      } catch (error) {
        console.error("Error fetching visit data:", error);
        toast.error("Erro ao carregar dados de visitas");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitData();
  }, [user, userRole]);

  const fetchVisitStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Visitas hoje
    const { data: visitsToday, error: todayError } = await supabase
      .from("public_visits")
      .select("id, ip_address")
      .gte("created_at", today.toISOString());

    // Visitas da semana
    const { data: visitsWeek, error: weekError } = await supabase
      .from("public_visits")
      .select("id")
      .gte("created_at", weekAgo.toISOString());

    // Top páginas (últimos 7 dias)
    const { data: topPagesData, error: pagesError } = await supabase
      .from("public_visits")
      .select("url")
      .gte("created_at", weekAgo.toISOString());

    if (todayError) console.error("Error fetching today visits:", todayError);
    if (weekError) console.error("Error fetching week visits:", weekError);
    if (pagesError) console.error("Error fetching pages data:", pagesError);

    // Calcular estatísticas
    const totalVisitsToday = visitsToday?.length || 0;
    const totalVisitsWeek = visitsWeek?.length || 0;
    const uniqueIPsToday = new Set(visitsToday?.map(v => v.ip_address) || []).size;

    // Contar páginas mais visitadas
    const pageCounts: Record<string, number> = {};
    topPagesData?.forEach(visit => {
      if (visit.url) {
        pageCounts[visit.url] = (pageCounts[visit.url] || 0) + 1;
      }
    });

    const topPages = Object.entries(pageCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setStats(prev => ({
      ...prev,
      totalVisitsToday,
      totalVisitsWeek,
      uniqueIPsToday,
      topPages
    }));
  };

const fetchRecentVisits = async () => {
  if (!user || userRole !== "admin") return;
  setLoadingTable(true);

  let query = supabase
    .from("public_visits")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (dateRange !== 'all') {
    const now = new Date();
    let start = new Date();
    if (dateRange === '24h') start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (dateRange === '7d') start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (dateRange === '30d') start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    query = query.gte("created_at", start.toISOString());
  }

  if (pathFilter) {
    query = query.ilike("pathname", `%${pathFilter}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error fetching recent visits:", error);
  } else {
    setStats(prev => ({
      ...prev,
      recentVisits: (data as PublicVisit[]) || []
    }));
    setTotal(count || 0);
  }

  setLoadingTable(false);
};

  const getBrowserFromUserAgent = (userAgent: string): string => {
    if (!userAgent) return "Desconhecido";
    
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    if (userAgent.includes("Opera")) return "Opera";
    
    return "Outro";
  };

  const getDeviceFromUserAgent = (userAgent: string): string => {
    if (!userAgent) return "Desconhecido";
    
    if (userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone")) {
      return "Mobile";
    }
    if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
      return "Tablet";
    }
    
    return "Desktop";
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchVisitStats(),
        fetchRecentVisits()
      ]);
      toast.success("Dados atualizados com sucesso");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Erro ao atualizar dados");
    } finally {
      setLoading(false);
    }
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
              <h1 className="text-2xl font-bold text-foreground">Visitas Públicas</h1>
              <p className="text-muted-foreground">Monitoramento de acessos ao site</p>
            </div>
            
            <Button onClick={refreshData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        <AdminSecurityBanner />

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas Hoje</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalVisitsToday}</div>
              <p className="text-xs text-muted-foreground">
                Total de acessos hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas (7 dias)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalVisitsWeek}</div>
              <p className="text-xs text-muted-foreground">
                Total nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">IPs Únicos Hoje</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.uniqueIPsToday}</div>
              <p className="text-xs text-muted-foreground">
                Visitantes únicos hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              <Globe className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.recentVisits.length}</div>
              <p className="text-xs text-muted-foreground">
                Visitas registradas (máx. 500)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Páginas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top 10 Páginas (7 dias)
              </CardTitle>
              <CardDescription>
                Páginas mais visitadas na última semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.topPages.map((page, index) => (
                  <div key={page.url} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-[200px]">{page.url}</span>
                    </div>
                    <Badge variant="secondary">{page.count}</Badge>
                  </div>
                ))}
                {stats.topPages.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma visita registrada</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo por Device/Browser */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Dispositivos & Navegadores
              </CardTitle>
              <CardDescription>
                Análise dos últimos 100 acessos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dispositivos */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Dispositivos
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['Desktop', 'Mobile', 'Tablet'].map(device => {
                      const count = stats.recentVisits.slice(0, 100).filter(v => 
                        getDeviceFromUserAgent(v.user_agent || '') === device
                      ).length;
                      return (
                        <div key={device} className="text-center p-2 bg-muted/50 rounded">
                          <div className="font-bold">{count}</div>
                          <div className="text-xs text-muted-foreground">{device}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navegadores */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Navegadores
                  </h4>
                  <div className="space-y-1">
                    {['Chrome', 'Firefox', 'Safari', 'Edge'].map(browser => {
                      const count = stats.recentVisits.slice(0, 100).filter(v => 
                        getBrowserFromUserAgent(v.user_agent || '') === browser
                      ).length;
                      return count > 0 ? (
                        <div key={browser} className="flex justify-between text-sm">
                          <span>{browser}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Visitas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Visitas Recentes
            </CardTitle>
            <CardDescription>
              Últimas 500 visitas registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Navegador</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>Referer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(visit.created_at), "dd/MM/yy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {visit.ip_address}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate">
                          {visit.url}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getBrowserFromUserAgent(visit.user_agent || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getDeviceFromUserAgent(visit.user_agent || '') === 'Mobile' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {getDeviceFromUserAgent(visit.user_agent || '')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[150px]">
                        {visit.referer ? (
                          <div className="truncate text-xs text-muted-foreground">
                            {visit.referer}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Direto</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {stats.recentVisits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma visita registrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}