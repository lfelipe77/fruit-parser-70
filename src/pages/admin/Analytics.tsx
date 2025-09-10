import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Gift,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Clock,
  Target,
  Loader2,
} from "lucide-react";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";

export default function Analytics() {
  const { overview, categories, organizers, trends, geography, loading, error } = useAdminAnalytics();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return (
        <Badge variant="outline" className="text-green-600 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{growth}%
        </Badge>
      );
    } else if (growth < 0) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-200">
          <TrendingDown className="h-3 w-3 mr-1" />
          {growth}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="text-gray-600 border-gray-200">
          0%
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics e Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada de performance e métricas da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30days">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="90days">Últimos 90 dias</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalUsers || 0)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(overview?.monthlyGrowth.users || 0)}
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhaveis</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.totalRaffles || 0)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(overview?.monthlyGrowth.raffles || 0)}
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview?.totalRevenue || 0)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(overview?.monthlyGrowth.revenue || 0)}
              <span className="text-muted-foreground">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhaveis Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(overview?.activeRaffles || 0)}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">atualmente</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="organizers">Organizadores</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="geography">Geografia</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
              <CardDescription>
                Análise de receita e quantidade de ganhaveis por categoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.rafflesCount} ganhaveis</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(category.revenue)}</div>
                      <div className="flex items-center gap-1">
                        {getGrowthBadge(category.growth)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizers Tab */}
        <TabsContent value="organizers">
          <Card>
            <CardHeader>
              <CardTitle>Top Organizadores</CardTitle>
              <CardDescription>
                Organizadores com melhor performance na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizers.map((organizer, index) => (
                  <div key={organizer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{organizer.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{organizer.rafflesCount} ganhaveis</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(organizer.totalRevenue)}</div>
                      <div className="text-sm text-muted-foreground">receita total</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendências Semanais</CardTitle>
              <CardDescription>
                Comparativo entre esta semana e a semana anterior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend) => (
                  <div key={trend.metric} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{trend.metric}</h3>
                      <p className="text-sm text-muted-foreground">
                        Esta semana vs semana anterior
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Esta semana</div>
                          <div className="font-medium">
                            {trend.metric === "Receita" 
                              ? formatCurrency(trend.thisWeek)
                              : trend.metric === "Taxa de Conclusão"
                              ? `${trend.thisWeek}%`
                              : formatNumber(trend.thisWeek)
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Anterior</div>
                          <div className="font-medium">
                            {trend.metric === "Receita" 
                              ? formatCurrency(trend.lastWeek)
                              : trend.metric === "Taxa de Conclusão"
                              ? `${trend.lastWeek}%`
                              : formatNumber(trend.lastWeek)
                            }
                          </div>
                        </div>
                        <div>
                          {getGrowthBadge(trend.change)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Geográfica</CardTitle>
              <CardDescription>
                Performance por estado brasileiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geography.map((state, index) => (
                  <div key={state.state} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{state.state}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(state.usersCount)} usuários • {state.rafflesCount} ganhaveis
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(state.revenue)}</div>
                      <div className="text-sm text-muted-foreground">receita total</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}