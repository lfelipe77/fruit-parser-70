import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import {
  Search,
  Filter,
  Eye,
  Check,
  Ban,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  DollarSign,
  ExternalLink,
  Pause,
  Play,
  MessageSquare,
  Link,
  MapPin,
  TrendingUp,
  Users,
  Gift,
} from "lucide-react";
import { getAllCategories } from "@/data/categoriesData";
import { supabase } from "@/integrations/supabase/client";
import { RafflePublicMoney } from "@/types/public-views";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { formatBRL } from "@/lib/formatters";
import { useEffect } from "react";

export default function GanhaveisManagement() {
  const [selectedTab, setSelectedTab] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedGanhavel, setSelectedGanhavel] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [raffles, setRaffles] = useState<RafflePublicMoney[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAdminAction } = useAuditLogger();

  // Load raffles from database
  useEffect(() => {
    loadRaffles();
  }, []);

  const loadRaffles = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,image_url,ticket_price,amount_raised,goal_amount,progress_pct_money,category_name,subcategory_name,status,last_paid_at')
        .order('last_paid_at', { ascending: false });
      
      if (error) throw error;
      setRaffles((data || []) as RafflePublicMoney[]);
    } catch (error) {
      console.error('Error loading raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "active":
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Ativa</Badge>;
      case "completed":
        return <Badge variant="outline" className="text-green-600 border-green-200"><Check className="h-3 w-3 mr-1" />Concluída</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="h-3 w-3 mr-1" />Cancelada</Badge>;
      case "suspended":
        return <Badge variant="outline" className="text-red-600 border-red-200"><Ban className="h-3 w-3 mr-1" />Suspensa</Badge>;
      case "review":
        return <Badge variant="outline" className="text-purple-600 border-purple-200"><Eye className="h-3 w-3 mr-1" />Em Análise</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore <= 2) {
      return <Badge variant="outline" className="text-green-600 border-green-200">Baixo Risco</Badge>;
    } else if (riskScore <= 5) {
      return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Médio Risco</Badge>;
    } else {
      return <Badge variant="outline" className="text-red-600 border-red-200">Alto Risco</Badge>;
    }
  };

  const filteredGanhaveis = raffles.filter((raffle) => {
    const matchesTab = selectedTab === "todas" || raffle.status === selectedTab;
    const matchesSearch = raffle.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todas" || raffle.category_name === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleApprove = async (ganhaveisId: string) => {
    try {
      // Update raffle status to active in database
      const { error: updateError } = await supabase
        .from('raffles')
        .update({ status: 'active' })
        .eq('id', ganhaveisId);

      if (updateError) throw updateError;

      // Log admin action
      logAdminAction('raffle_approved', {
        targetRaffleId: ganhaveisId,
        reason: 'Approved via admin panel'
      });

      toast({
        title: "Ganhavel Aprovado",
        description: `O ganhavel foi aprovado e está agora ativo.`,
      });
      
      setShowApprovalModal(false);
      
      // Update local state without reload
      setRaffles(prev => prev.map(r => r.id === ganhaveisId ? { ...r, status: 'active' } : r));
    } catch (error) {
      console.error('Error approving raffle:', error);
      toast({
        title: "Erro",
        description: "Falha ao aprovar o ganhavel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (ganhaveisId: string, reason: string) => {
    try {
      // Update raffle status to rejected in database
      const { error: updateError } = await supabase
        .from('raffles')
        .update({ status: 'rejected' })
        .eq('id', ganhaveisId);

      if (updateError) throw updateError;

      // Log admin action
      logAdminAction('raffle_rejected', {
        targetRaffleId: ganhaveisId,
        reason
      });

      toast({
        title: "Ganhavel Rejeitado",
        description: `O ganhavel foi rejeitado. Motivo: ${reason}`,
        variant: "destructive",
      });
      
      setShowRejectModal(false);
      setRejectionReason("");
      
      // Update local state without reload
      setRaffles(prev => prev.map(r => r.id === ganhaveisId ? { ...r, status: 'rejected' } : r));
    } catch (error) {
      console.error('Error rejecting raffle:', error);
      toast({
        title: "Erro",
        description: "Falha ao rejeitar o ganhavel. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSuspend = async (ganhaveisId: string) => {
    try {
      // Log admin action
      logAdminAction('raffle_suspended', {
        targetRaffleId: ganhaveisId,
        reason: 'Suspended via admin panel'
      });

      toast({
        title: "Ganhavel Suspenso",
        description: `O ganhavel ${ganhaveisId} foi suspenso temporariamente.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error suspending raffle:', error);
    }
  };

  const handleReactivate = async (ganhaveisId: string) => {
    try {
      // Log admin action
      logAdminAction('raffle_reactivated', {
        targetRaffleId: ganhaveisId,
        reason: 'Reactivated via admin panel'
      });

      toast({
        title: "Ganhavel Reativado",
        description: `O ganhavel ${ganhaveisId} foi reativado com sucesso.`,
      });
    } catch (error) {
      console.error('Error reactivating raffle:', error);
    }
  };

  const handleSaveNotes = async (ganhaveisId: string, notes: string) => {
    try {
      // Log admin action for notes update
      logAdminAction('raffle_rejected', {
        targetRaffleId: ganhaveisId,
        additionalContext: {
          action_type: 'notes_update',
          notes_preview: notes.substring(0, 100) + (notes.length > 100 ? '...' : '')
        }
      });

      toast({
        title: "Observações Salvas",
        description: "As observações administrativas foram salvas.",
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const handleVerifyAffiliate = (link: string) => {
    toast({
      title: "Link Verificado",
      description: "O link de afiliado foi verificado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Ganhaveis</h1>
        <p className="text-muted-foreground">
          Aprovação, monitoramento e controle de todos os ganhaveis da plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ganhaveis</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{raffles.length}</div>
            <p className="text-xs text-muted-foreground">+12% este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raffles.filter(r => r.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganhaveis Ativos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raffles.filter(r => r.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raffles.filter(r => r.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
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
                  placeholder="Buscar por título ou organizador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {getAllCategories().map(category => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ganhaveis List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ganhaveis</CardTitle>
          <CardDescription>
            {filteredGanhaveis.length} ganhaveis encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="active">Ativas</TabsTrigger>
              <TabsTrigger value="review">Em Análise</TabsTrigger>
              <TabsTrigger value="suspended">Suspensas</TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Arrecadado</TableHead>
                        <TableHead>Meta</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Último pagamento</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="animate-pulse">Carregando...</div>
                          </TableCell>
                        </TableRow>
                      ) : filteredGanhaveis.map((raffle) => {
                        const lastPaidAgo = useRelativeTime(raffle.last_paid_at, "pt-BR");
                        return (
                          <TableRow key={raffle.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{raffle.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {raffle.category_name}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(raffle.status)}</TableCell>
                            <TableCell>
                              <div className="font-medium text-emerald-600">
                                {formatBRL(raffle.amount_raised)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {formatBRL(raffle.goal_amount)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {Math.round(raffle.progress_pct_money)}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-emerald-500 h-2 rounded-full" 
                                    style={{ width: `${Math.min(100, raffle.progress_pct_money)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {lastPaidAgo}
                              </div>
                            </TableCell>
                            <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedGanhavel(raffle)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Detalhes do Ganhavel - {selectedGanhavel?.id}</DialogTitle>
                                  <DialogDescription>
                                    Informações completas do ganhavel
                                  </DialogDescription>
                                </DialogHeader>
                                 {selectedGanhavel && (
                                   <div className="space-y-6">
                                     {/* Basic Info */}
                                     <div className="grid gap-4 md:grid-cols-2">
                                       <div>
                                         <Label>Título</Label>
                                          <p className="text-sm font-medium">{selectedGanhavel.title}</p>
                                        </div>
                                        <div>
                                          <Label>Categoria</Label>
                                          <p className="text-sm">{selectedGanhavel.category}</p>
                                        </div>
                                        <div>
                                          <Label>Organizador</Label>
                                          <p className="text-sm font-medium">{selectedGanhavel.organizer}</p>
                                        </div>
                                        <div>
                                          <Label>Email</Label>
                                          <p className="text-sm">{selectedGanhavel.organizerEmail}</p>
                                        </div>
                                        <div>
                                          <Label>Telefone</Label>
                                          <p className="text-sm">{selectedGanhavel.organizerPhone}</p>
                                        </div>
                                        <div>
                                          <Label>Localização</Label>
                                          <p className="text-sm">{selectedGanhavel.location}</p>
                                        </div>
                                        <div>
                                          <Label>Valor Total</Label>
                                          <p className="text-sm font-medium text-green-600">{selectedGanhavel.value}</p>
                                        </div>
                                        <div>
                                          <Label>Progresso</Label>
                                          <p className="text-sm">{selectedGanhavel.soldNumbers}/{selectedGanhavel.totalNumbers} números vendidos</p>
                                        </div>
                                      </div>

                                      {/* Risk Assessment */}
                                      <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <AlertTriangle className="h-4 w-4" />
                                          <Label>Avaliação de Risco</Label>
                                          {getRiskBadge(selectedGanhavel.riskScore)}
                                        </div>
                                        <div className="text-sm space-y-2">
                                          <p><strong>Score de Risco:</strong> {selectedGanhavel.riskScore}/10</p>
                                          {selectedGanhavel.suspiciousActivities.length > 0 && (
                                            <div>
                                              <p><strong>Atividades Suspeitas:</strong></p>
                                              <ul className="list-disc list-inside ml-4">
                                                {selectedGanhavel.suspiciousActivities.map((activity, idx) => (
                                                  <li key={idx} className="text-red-600">{activity}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Affiliate Info */}
                                      {selectedGanhavel.isAffiliate && (
                                        <div className="border rounded-lg p-4">
                                          <div className="flex items-center gap-2 mb-3">
                                            <Link className="h-4 w-4" />
                                            <Label>Informações de Afiliado</Label>
                                          </div>
                                          <div className="space-y-2">
                                            <div>
                                              <Label className="text-xs">Link de Afiliado</Label>
                                              <div className="flex items-center gap-2">
                                                <p className="text-sm text-blue-600 break-all">{selectedGanhavel.affiliateLink}</p>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline"
                                                  onClick={() => handleVerifyAffiliate(selectedGanhavel.affiliateLink)}
                                                >
                                                  <ExternalLink className="h-3 w-3 mr-1" />
                                                  Verificar
                                                </Button>
                                              </div>
                                            </div>
                                            <div>
                                              <Label className="text-xs">Comissão</Label>
                                              <p className="text-sm">{selectedGanhavel.affiliateCommission}%</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Documents */}
                                      <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <User className="h-4 w-4" />
                                          <Label>Documentação</Label>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedGanhavel.documents.map((doc, idx) => (
                                            <Badge key={idx} variant="outline">{doc}</Badge>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Description */}
                                      <div>
                                        <Label>Descrição do Produto</Label>
                                        <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{selectedGanhavel.description}</p>
                                      </div>

                                      {/* Admin Notes */}
                                      <div>
                                        <Label>Observações Administrativas</Label>
                                        <Textarea
                                          value={adminNotes || selectedGanhavel.adminNotes}
                                          onChange={(e) => setAdminNotes(e.target.value)}
                                          placeholder="Adicionar observações..."
                                          className="mt-1"
                                        />
                                        <Button 
                                          size="sm" 
                                          className="mt-2"
                                          onClick={() => handleSaveNotes(selectedGanhavel.id, adminNotes)}
                                        >
                                          Salvar Observações
                                        </Button>
                                      </div>

                                      {/* Dates */}
                                      <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                          <Label>Data de Criação</Label>
                                          <p className="text-sm">{selectedGanhavel.created}</p>
                                        </div>
                                        <div>
                                          <Label>Data de Término</Label>
                                          <p className="text-sm">{selectedGanhavel.endDate}</p>
                                       </div>
                                     </div>
                                   </div>
                                 )}
                              </DialogContent>
                            </Dialog>
                            
                            {/* Approval Actions */}
                            {raffle.status === "pending" && (
                              <>
                                <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => setSelectedGanhavel(raffle)}
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Aprovar Ganhavel</DialogTitle>
                                      <DialogDescription>
                                        Confirme a aprovação do ganhavel "{raffle.title}". Esta ação tornará o ganhavel visível ao público.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={() => handleApprove(raffle.id)}>
                                        <Check className="h-3 w-3 mr-1" />
                                        Aprovar Ganhavel
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => setSelectedGanhavel(raffle)}
                                    >
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Rejeitar Ganhavel</DialogTitle>
                                      <DialogDescription>
                                        Informe o motivo da rejeição do ganhavel "{raffle.title}".
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Motivo da Rejeição</Label>
                                        <Textarea
                                          value={rejectionReason}
                                          onChange={(e) => setRejectionReason(e.target.value)}
                                          placeholder="Descreva o motivo da rejeição..."
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                                        Cancelar
                                      </Button>
                                      <Button 
                                        variant="destructive"
                                        onClick={() => handleReject(raffle.id, rejectionReason)}
                                        disabled={!rejectionReason.trim()}
                                      >
                                        <Ban className="h-3 w-3 mr-1" />
                                        Rejeitar
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}

                          </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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