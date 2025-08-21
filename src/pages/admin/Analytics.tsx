import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabsPlaceholder";
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
} from "lucide-react";
import { getAllCategories } from "@/data/categoriesData";

const metricsData = {
  overview: {
    totalUsers: { value: 2847, growth: 12, period: "este mês" },
    totalRifas: { value: 156, growth: 8, period: "este mês" },
    totalRevenue: { value: 156750, growth: 18, period: "este mês" },
    conversionRate: { value: 73.5, growth: 2.1, period: "este mês" },
  },
  topCategories: getAllCategories().slice(0, 4).map(cat => ({
    name: cat.name,
    rifas: cat.count,
    revenue: cat.count * 1500, // Mock calculation
    growth: Math.floor(Math.random() * 20) + 5 // Random growth between 5-25%
  })),
  topOrganizers: [
    { name: "João Silva", rifas: 8, revenue: 45000, rating: 4.9 },
    { name: "Maria Santos", rifas: 6, revenue: 125000, rating: 4.8 },
    { name: "Carlos Mendes", rifas: 5, revenue: 32000, rating: 4.7 },
    { name: "Ana Costa", rifas: 4, revenue: 28000, rating: 4.6 },
  ],
  recentTrends: [
    { metric: "Ganhaveis Criados", thisWeek: 24, lastWeek: 18, change: 33 },
    { metric: "Novos Usuários", thisWeek: 156, lastWeek: 134, change: 16 },
    { metric: "Receita", thisWeek: 23400, lastWeek: 19800, change: 18 },
    { metric: "Taxa de Conclusão", thisWeek: 87, lastWeek: 82, change: 6 },
  ],
  geoData: [
    { state: "São Paulo", users: 1245, rifas: 67, revenue: 89000 },
    { state: "Rio de Janeiro", users: 456, rifas: 23, revenue: 34000 },
    { state: "Minas Gerais", users: 234, rifas: 12, revenue: 18000 },
    { state: "Paraná", users: 187, rifas: 15, revenue: 22000 },
    { state: "Bahia", users: 156, rifas: 8, revenue: 12000 },
  ],
};

export default function Analytics() {
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
            <div className="text-2xl font-bold">{formatNumber(metricsData.overview.totalUsers.value)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(metricsData.overview.totalUsers.growth)}
              <span className="text-muted-foreground">{metricsData.overview.totalUsers.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhaveis</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metricsData.overview.totalRifas.value)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(metricsData.overview.totalRifas.growth)}
              <span className="text-muted-foreground">{metricsData.overview.totalRifas.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metricsData.overview.totalRevenue.value)}</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(metricsData.overview.totalRevenue.growth)}
              <span className="text-muted-foreground">{metricsData.overview.totalRevenue.period}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.overview.conversionRate.value}%</div>
            <div className="flex items-center gap-2 text-xs">
              {getGrowthBadge(metricsData.overview.conversionRate.growth)}
              <span className="text-muted-foreground">{metricsData.overview.conversionRate.period}</span>
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
                {metricsData.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.rifas} ganhaveis</p>
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
                {metricsData.topOrganizers.map((organizer, index) => (
                  <div key={organizer.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{organizer.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{organizer.rifas} ganhaveis</span>
                          <span>•</span>
                          <span>⭐ {organizer.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(organizer.revenue)}</div>
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
                {metricsData.recentTrends.map((trend) => (
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
                {metricsData.geoData.map((state, index) => (
                  <div key={state.state} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium">{state.state}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(state.users)} usuários • {state.rifas} ganhaveis
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