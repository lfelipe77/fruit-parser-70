import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  Eye,
  Check,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  AlertTriangle,
  Download,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useFinancialStats } from "@/hooks/useFinancialStats";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toBRL } from "@/utils/money";
import { useToast } from "@/hooks/use-toast";

export default function FinancialControl() {
  const { isAdmin } = useIsAdmin();
  const { stats, transactions, loading, error, refreshData } = useFinancialStats();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("todos");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Acesso negado. Apenas administradores podem ver esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-200"><Check className="h-3 w-3 mr-1" />Concluído</Badge>;
      case "processing":
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><Clock className="h-3 w-3 mr-1" />Processando</Badge>;
      case "disputed":
        return <Badge variant="outline" className="text-red-600 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Disputado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "payment_release":
        return <Badge variant="default">Liberação</Badge>;
      case "commission":
        return <Badge variant="secondary">Comissão</Badge>;
      case "refund":
        return <Badge variant="outline" className="text-red-600 border-red-200">Reembolso</Badge>;
      case "dispute":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Disputa</Badge>;
      default:
        return <Badge variant="outline">Outro</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "pix":
        return <Banknote className="h-4 w-4" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab = selectedTab === "todas" || transaction.status === selectedTab;
    const matchesSearch = transaction.raffle_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.organizer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "todos" || transaction.type === selectedType;
    
    return matchesTab && matchesSearch && matchesType;
  });

  const handleReleasePayment = (transactionId: string) => {
    console.log("Liberar pagamento:", transactionId);
    // Implementar lógica de liberação de pagamento
  };

  const handleResolveDispute = (transactionId: string) => {
    console.log("Resolver disputa:", transactionId);
    // Implementar lógica de resolução de disputa
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Controle Financeiro</h1>
        <p className="text-muted-foreground">
          Gerencie pagamentos, comissões e transações financeiras
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBRL(stats?.totalRevenue || 0)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats?.monthlyGrowth ? `${stats.monthlyGrowth.toFixed(1)}%` : '0%'} este mês
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBRL(stats?.totalCommissions || 0)}</div>
            <p className="text-xs text-muted-foreground">10% de taxa média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBRL(stats?.pendingPayments || 0)}</div>
            <p className="text-xs text-muted-foreground">Aguardando liberação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toBRL(stats?.totalRefunds || 0)}</div>
            <p className="text-xs text-muted-foreground">Ganhaveis cancelados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Disputas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.disputeRate ? `${stats.disputeRate.toFixed(1)}%` : '0%'}</div>
            <p className="text-xs text-muted-foreground">Abaixo da média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" className="w-full">
              <Download className="h-3 w-3 mr-2" />
              Exportar
            </Button>
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
                  placeholder="Buscar por ganhavel, organizador ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Transação</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="payment_release">Liberação de Pagamento</SelectItem>
                  <SelectItem value="commission">Comissão</SelectItem>
                  <SelectItem value="refund">Reembolso</SelectItem>
                  <SelectItem value="dispute">Disputa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Financeiras</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transações encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
              <TabsTrigger value="processing">Processando</TabsTrigger>
              <TabsTrigger value="disputed">Disputadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Ganhavel</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Taxa</TableHead>
                      <TableHead>Líquido</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.raffle_title}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.organizer_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                        <TableCell className="font-medium">{toBRL(transaction.amount)}</TableCell>
                        <TableCell className="text-red-600">{toBRL(transaction.fee_amount)}</TableCell>
                        <TableCell className="font-medium text-green-600">{toBRL(transaction.net_amount)}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getMethodIcon(transaction.payment_method)}
                            <span className="text-sm capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedTransaction(transaction)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Transação - {selectedTransaction?.id}</DialogTitle>
                                  <DialogDescription>
                                    Informações completas da transação financeira
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label>ID da Transação</Label>
                                        <p className="text-sm">{selectedTransaction.id}</p>
                                      </div>
                                      <div>
                                        <Label>ID do Ganhavel</Label>
                                        <p className="text-sm">{selectedTransaction.raffle_id}</p>
                                      </div>
                                      <div>
                                        <Label>Título do Ganhavel</Label>
                                        <p className="text-sm">{selectedTransaction.raffle_title}</p>
                                      </div>
                                      <div>
                                        <Label>Organizador</Label>
                                        <p className="text-sm">{selectedTransaction.organizer_name}</p>
                                      </div>
                                      <div>
                                        <Label>Valor Bruto</Label>
                                        <p className="text-sm font-medium">{toBRL(selectedTransaction.amount)}</p>
                                      </div>
                                      <div>
                                        <Label>Taxa</Label>
                                        <p className="text-sm text-red-600">{toBRL(selectedTransaction.fee_amount)}</p>
                                      </div>
                                      <div>
                                        <Label>Valor Líquido</Label>
                                        <p className="text-sm font-medium text-green-600">{toBRL(selectedTransaction.net_amount)}</p>
                                      </div>
                                      <div>
                                        <Label>Método de Pagamento</Label>
                                        <p className="text-sm capitalize">{selectedTransaction.payment_method?.replace('_', ' ')}</p>
                                      </div>
                                      <div>
                                        <Label>Data</Label>
                                        <p className="text-sm">{new Date(selectedTransaction.transaction_date).toLocaleDateString('pt-BR')}</p>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <Label>Descrição</Label>
                                      <p className="text-sm">{selectedTransaction.description}</p>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            
                            {transaction.status === "pending" && transaction.type === "payment_release" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Liberar Pagamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja liberar o pagamento de {toBRL(transaction.net_amount)} para {transaction.organizer_name}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReleasePayment(transaction.id)}>
                                      Liberar Pagamento
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            
                            {transaction.status === "disputed" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-blue-600 hover:text-blue-700"
                                onClick={() => handleResolveDispute(transaction.id)}
                              >
                                <AlertTriangle className="h-3 w-3" />
                              </Button>
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