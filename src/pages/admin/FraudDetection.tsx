import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/TabsPlaceholder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Eye,
  AlertTriangle,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Target,
} from "lucide-react";

const fraudAlertsData = [
  {
    id: "FR001",
    type: "suspicious_velocity",
    severity: "high",
    status: "investigating",
    rifaId: "RF004",
    rifaTitle: "Apartamento Alphaville",
    userId: "U004",
    userName: "Ana Costa",
    description: "Vendas muito rápidas em horário suspeito",
    detectedAt: "2024-01-15 03:22",
    riskScore: 85,
    indicators: [
      "100 números vendidos em 5 minutos",
      "Horário atípico (madrugada)",
      "IPs diferentes mas mesma região",
      "Padrão de cliques automatizado"
    ],
    automaticActions: ["Ganhavel suspenso temporariamente", "Notificação enviada ao admin"],
  },
  {
    id: "FR002",
    type: "multiple_accounts",
    severity: "medium",
    status: "confirmed",
    rifaId: "RF002",
    rifaTitle: "Honda Civic 2024",
    userId: "U003",
    userName: "Carlos Mendes",
    description: "Múltiplas contas com mesmo CPF",
    detectedAt: "2024-01-14 16:30",
    riskScore: 72,
    indicators: [
      "3 contas com mesmo CPF",
      "Endereços similares",
      "Mesmo dispositivo utilizado",
      "Participação em ganhaveis do mesmo organizador"
    ],
    automaticActions: ["Contas marcadas para revisão", "Participações bloqueadas"],
  },
  {
    id: "FR003",
    type: "fake_affiliate",
    severity: "high",
    status: "resolved",
    rifaId: "RF001",
    rifaTitle: "iPhone 15 Pro Max",
    userId: "U001",
    userName: "João Silva",
    description: "Link de afiliado falsificado",
    detectedAt: "2024-01-13 14:15",
    riskScore: 91,
    indicators: [
      "Link não oficial da Amazon",
      "Redirecionamento suspeito",
      "Domínio registrado recentemente",
      "Sem comissão válida"
    ],
    automaticActions: ["Ganhavel removido", "Usuário notificado", "Reembolsos processados"],
  },
];

const fraudStatsData = {
  totalAlerts: 127,
  highSeverity: 23,
  resolvedToday: 8,
  falsePositives: 12,
  accuracyRate: 87.3,
  avgResolutionTime: "2.4h",
};

export default function FraudDetection() {
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState("todas");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const { toast } = useToast();

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Média</Badge>;
      case "low":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "investigating":
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><Eye className="h-3 w-3 mr-1" />Investigando</Badge>;
      case "confirmed":
        return <Badge variant="outline" className="text-red-600 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>;
      case "false_positive":
        return <Badge variant="outline" className="text-gray-600 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Falso Positivo</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "suspicious_velocity":
        return <Zap className="h-4 w-4 text-orange-500" />;
      case "multiple_accounts":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "fake_affiliate":
        return <Target className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "suspicious_velocity":
        return "Velocidade Suspeita";
      case "multiple_accounts":
        return "Múltiplas Contas";
      case "fake_affiliate":
        return "Link Falso";
      default:
        return "Outro";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const filteredAlerts = fraudAlertsData.filter((alert) => {
    const matchesTab = selectedTab === "todos" || alert.status === selectedTab;
    const matchesSearch = alert.rifaTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "todas" || alert.severity === selectedSeverity;
    
    return matchesTab && matchesSearch && matchesSeverity;
  });

  const handleMarkAsFalsePositive = (alertId: string) => {
    toast({
      title: "Marcado como Falso Positivo",
      description: `O alerta ${alertId} foi marcado como falso positivo.`,
    });
  };

  const handleConfirmFraud = (alertId: string) => {
    toast({
      title: "Fraude Confirmada",
      description: `O alerta ${alertId} foi confirmado como fraude.`,
      variant: "destructive",
    });
  };

  const handleResolve = (alertId: string) => {
    toast({
      title: "Alerta Resolvido",
      description: `O alerta ${alertId} foi marcado como resolvido.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detecção de Fraudes</h1>
        <p className="text-muted-foreground">
          Sistema inteligente de detecção e prevenção de atividades suspeitas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudStatsData.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">+15% esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Severidade</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fraudStatsData.highSeverity}</div>
            <p className="text-xs text-muted-foreground">Requer atenção imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Precisão</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fraudStatsData.accuracyRate}%</div>
            <p className="text-xs text-muted-foreground">Do sistema de IA</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudStatsData.resolvedToday}</div>
            <p className="text-xs text-muted-foreground">Casos processados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudStatsData.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">Para resolução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falsos Positivos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fraudStatsData.falsePositives}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ganhavel, usuário ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as severidades</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Fraude</CardTitle>
          <CardDescription>
            {filteredAlerts.length} alertas encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="investigating">Investigando</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
              <TabsTrigger value="false_positive">Falso Positivo</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Ganhavel</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Detectado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(alert.type)}
                            <span className="text-sm">{getTypeName(alert.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.rifaTitle}</div>
                            <div className="text-sm text-muted-foreground">{alert.rifaId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{alert.userName}</div>
                            <div className="text-sm text-muted-foreground">{alert.userId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${getRiskColor(alert.riskScore)}`}>
                              {alert.riskScore}%
                            </span>
                            <Progress 
                              value={alert.riskScore} 
                              className="w-16 h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(alert.status)}</TableCell>
                        <TableCell className="text-sm">{alert.detectedAt}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedAlert(alert)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Alerta de Fraude - {selectedAlert?.id}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Detalhes do alerta de segurança detectado pelo sistema
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedAlert && (
                                  <div className="space-y-6">
                                    {/* Alert Overview */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label>Tipo de Fraude</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          {getTypeIcon(selectedAlert.type)}
                                          <span className="font-medium">{getTypeName(selectedAlert.type)}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Risk Score</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className={`text-lg font-bold ${getRiskColor(selectedAlert.riskScore)}`}>
                                            {selectedAlert.riskScore}%
                                          </span>
                                          <Progress value={selectedAlert.riskScore} className="flex-1 h-3" />
                                        </div>
                                      </div>
                                      <div>
                                        <Label>Severidade</Label>
                                        <div className="mt-1">{getSeverityBadge(selectedAlert.severity)}</div>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                                      </div>
                                    </div>

                                    {/* Related Info */}
                                    <div className="border rounded-lg p-4">
                                      <Label className="text-base">Informações Relacionadas</Label>
                                      <div className="grid gap-4 md:grid-cols-2 mt-3">
                                        <div>
                                          <Label className="text-sm">Rifa</Label>
                                          <p className="text-sm font-medium">{selectedAlert.rifaTitle}</p>
                                          <p className="text-sm text-muted-foreground">{selectedAlert.rifaId}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm">Usuário Envolvido</Label>
                                          <p className="text-sm font-medium">{selectedAlert.userName}</p>
                                          <p className="text-sm text-muted-foreground">{selectedAlert.userId}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm">Detectado em</Label>
                                          <p className="text-sm">{selectedAlert.detectedAt}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                      <Label>Descrição do Incidente</Label>
                                      <p className="text-sm bg-yellow-50 p-3 rounded-md mt-1 border border-yellow-200">
                                        {selectedAlert.description}
                                      </p>
                                    </div>

                                    {/* Indicators */}
                                    <div>
                                      <Label>Indicadores de Risco Detectados</Label>
                                      <div className="grid gap-2 mt-3">
                                        {selectedAlert.indicators.map((indicator, idx) => (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 rounded-md border border-red-200">
                                            <AlertTriangle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm">{indicator}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Automatic Actions */}
                                    <div>
                                      <Label>Ações Automáticas Executadas</Label>
                                      <div className="grid gap-2 mt-3">
                                        {selectedAlert.automaticActions.map((action, idx) => (
                                          <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                                            <Shield className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm">{action}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4 border-t">
                                      <Button 
                                        variant="destructive"
                                        onClick={() => handleConfirmFraud(selectedAlert.id)}
                                        disabled={selectedAlert.status === "confirmed"}
                                      >
                                        <Ban className="h-4 w-4 mr-1" />
                                        Confirmar Fraude
                                      </Button>
                                      
                                      <Button 
                                        variant="outline"
                                        onClick={() => handleMarkAsFalsePositive(selectedAlert.id)}
                                        disabled={selectedAlert.status === "false_positive"}
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Falso Positivo
                                      </Button>
                                      
                                      <Button 
                                        onClick={() => handleResolve(selectedAlert.id)}
                                        disabled={selectedAlert.status === "resolved"}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Resolver
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {alert.status === "investigating" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleConfirmFraud(alert.id)}
                                >
                                  <Ban className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleMarkAsFalsePositive(alert.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}