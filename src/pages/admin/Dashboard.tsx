import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  Users,
  Gift,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Ban,
  Check,
} from "lucide-react";

const stats = [
  {
    title: "Total de Ganhaveis",
    value: "156",
    description: "+12% em relação ao mês passado",
    icon: Gift,
    trend: "up",
  },
  {
    title: "Usuários Ativos",
    value: "2,847",
    description: "+5% novos usuários esta semana",
    icon: Users,
    trend: "up",
  },
  {
    title: "Receita Total",
    value: "R$ 89,450",
    description: "+18% em relação ao mês passado",
    icon: DollarSign,
    trend: "up",
  },
  {
    title: "Taxa de Conversão",
    value: "73.5%",
    description: "+2.1% melhoria este mês",
    icon: TrendingUp,
    trend: "up",
  },
];

const pendingRifas = [
  {
    id: "RF001",
    title: "iPhone 15 Pro Max 256GB",
    organizer: "João Silva",
    value: "R$ 6.000",
    participants: 120,
    status: "pending",
    category: "Eletrônicos",
    created: "2024-01-15",
  },
  {
    id: "RF002",
    title: "Honda Civic 2024",
    organizer: "Maria Santos",
    value: "R$ 120.000",
    participants: 85,
    status: "pending",
    category: "Automóveis",
    created: "2024-01-14",
  },
  {
    id: "RF003",
    title: "Apartamento 2 Quartos - Alphaville",
    organizer: "Carlos Mendes",
    value: "R$ 350.000",
    participants: 45,
    status: "review",
    category: "Imóveis",
    created: "2024-01-13",
  },
];

const recentActivities = [
  {
    type: "approval",
    message: "Ganhavel 'PS5 + Setup Gamer' foi aprovada",
    time: "2 min atrás",
    icon: CheckCircle,
    color: "text-green-600",
  },
  {
    type: "new_user",
    message: "Novo usuário registrado: Ana Costa",
    time: "15 min atrás",
    icon: Users,
    color: "text-blue-600",
  },
  {
    type: "alert",
    message: "Ganhavel suspeito detectado - ID: RF004",
    time: "1h atrás",
    icon: AlertTriangle,
    color: "text-orange-600",
  },
  {
    type: "payment",
    message: "Pagamento de R$ 2.500 liberado para João S.",
    time: "2h atrás",
    icon: DollarSign,
    color: "text-green-600",
  },
];

export default function Dashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pendente</Badge>;
      case "review":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Em Análise</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de ganhaveis e métricas importantes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rifas Pendentes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ganhaveis Pendentes de Aprovação
            </CardTitle>
            <CardDescription>
              Ganhaveis que precisam de revisão e aprovação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Organizador</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRifas.map((rifa) => (
                    <TableRow key={rifa.id}>
                      <TableCell className="font-medium">{rifa.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rifa.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {rifa.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{rifa.organizer}</TableCell>
                      <TableCell>{rifa.value}</TableCell>
                      <TableCell>{rifa.participants}</TableCell>
                      <TableCell>{getStatusBadge(rifa.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}