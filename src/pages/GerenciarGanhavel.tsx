import Navigation from "@/components/Navigation";
import ShareButton from "@/components/ShareButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import GanhavesCancelButton from "@/components/RifaCancelButton";
import { 
  ArrowLeft, 
  Share2, 
  Copy, 
  Eye, 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Download,
  MessageSquare,
  Settings,
  AlertCircle
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function GerenciarRifa() {
  const { id } = useParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Mock data - replace with real data when Supabase is connected
  const rifa = {
    id: parseInt(id || "1"),
    title: "PS5 Setup Gamer Completo",
    description: "PlayStation 5 + controle extra + fone gamer + 3 jogos",
    image: "/src/assets/ps5-setup-gamer.jpg",
    status: "active" as const,
    totalTickets: 100,
    soldTickets: 75,
    ticketPrice: 5.00,
    createdAt: "2024-01-15",
    endDate: "2024-02-15",
    category: "Games",
    location: "São Paulo, SP"
  };

  const participants = [
    { id: 1, name: "João Silva", email: "joao@email.com", tickets: 5, totalPaid: 25, date: "2024-01-20" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", tickets: 3, totalPaid: 15, date: "2024-01-19" },
    { id: 3, name: "Pedro Costa", email: "pedro@email.com", tickets: 10, totalPaid: 50, date: "2024-01-18" },
    { id: 4, name: "Ana Oliveira", email: "ana@email.com", tickets: 2, totalPaid: 10, date: "2024-01-17" },
    { id: 5, name: "Carlos Mendes", email: "carlos@email.com", tickets: 7, totalPaid: 35, date: "2024-01-16" },
  ];

  const progress = (rifa.soldTickets / rifa.totalTickets) * 100;
  const totalRevenue = rifa.soldTickets * rifa.ticketPrice;
  const platformFee = totalRevenue * 0.08;
  const netRevenue = totalRevenue - platformFee;

  const handleCopyLink = () => {
    const ganhavelUrl = `${window.location.origin}/ganhavel/${rifa.id}`;
    navigator.clipboard.writeText(ganhavelUrl);
    setCopied(true);
    toast({
      title: "Link copiado!",
      description: "O link do ganhavel foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: rifa.title,
        text: `Participe do ganhavel: ${rifa.title}`,
        url: `${window.location.origin}/ganhavel/${rifa.id}`
      });
    } else {
      handleCopyLink();
    }
  };

  // Mock function to mark ticket as paid (this would be a real function in production)
  const handleMarkTicketPaid = async (ticketId: string, participantId: string) => {
    try {
      // Log audit event for marking ticket as paid
      const { error: auditError } = await (supabase as any).rpc('log_audit_event', {
        action: 'marked_ticket_paid',
        context: {
          page: 'PaginaDaRifa',
          ticket_id: ticketId,
          organizer_id: 'current_user_id' // This would be the real organizer ID
        }
      });

      if (auditError) {
        console.error('Error logging audit event:', auditError);
      }

      // TODO: Update ticket payment status in database
      toast({
        title: "Ticket marcado como pago",
        description: "O ticket foi marcado como pago com sucesso.",
      });
      
    } catch (error) {
      console.error('Error marking ticket as paid:', error);
      toast({
        title: "Erro ao marcar ticket",
        description: "Ocorreu um erro ao marcar o ticket como pago.",
        variant: "destructive"
      });
    }
  };

  // Function to update raffle status with comprehensive audit logging
  const handleUpdateRaffleStatus = async (newStatus: string) => {
    try {
      const oldStatus = rifa.status;
      
      // Log audit event for raffle status update
      const { error: auditError } = await supabase.rpc('log_audit_event', {
        action: 'edited_raffle',
        context: {
          raffle_id: rifa.id.toString(),
          updated_fields: ['status'],
          old_status: oldStatus,
          new_status: newStatus,
          page: 'GerenciarGanhavel'
        }
      });

      if (auditError) {
        console.error('Error logging audit event:', auditError);
      }

      // TODO: Update raffle status in database
      toast({
        title: "Status da rifa atualizado",
        description: `A rifa foi marcada como "${newStatus}".`,
      });
      
    } catch (error) {
      console.error('Error updating raffle status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status da rifa.",
        variant: "destructive"
      });
    }
  };

  // Example function for comprehensive raffle editing with audit logging
  const handleEditRaffle = async (updatedData: any, changedFields: string[]) => {
    try {
      // Log audit event for raffle editing
      await supabase.rpc('log_audit_event', {
        action: 'edited_raffle',
        context: {
          raffle_id: rifa.id.toString(),
          updated_fields: changedFields,
          page: 'GerenciarGanhavel',
          changes: changedFields.reduce((acc, field) => {
            acc[field] = {
              old: rifa[field as keyof typeof rifa],
              new: updatedData[field]
            };
            return acc;
          }, {} as any)
        }
      });

      // TODO: Update raffle in database with updatedData
      toast({
        title: "Rifa atualizada",
        description: `Campos alterados: ${changedFields.join(', ')}`,
      });
      
    } catch (error) {
      console.error('Error updating raffle:', error);
      toast({
        title: "Erro ao atualizar rifa",
        description: "Ocorreu um erro ao atualizar a rifa.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/minha-conta?tab=rifas-lancadas">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Gerenciar Rifa</h1>
          </div>

          {/* Rifa Overview */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={rifa.image} 
                  alt={rifa.title}
                  className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{rifa.title}</h2>
                    <p className="text-muted-foreground">{rifa.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <Badge variant={rifa.status === "active" ? "default" : "secondary"}>
                      {rifa.status === "active" ? "Em Andamento" : "Finalizada"}
                    </Badge>
                    <Badge variant="outline">{rifa.category}</Badge>
                    <Badge variant="outline">{rifa.location}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Vendidos</p>
                      <p className="font-semibold">{rifa.soldTickets}/{rifa.totalTickets}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preço</p>
                      <p className="font-semibold">R$ {rifa.ticketPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Criada em</p>
                      <p className="font-semibold">{new Date(rifa.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Participantes</p>
                      <p className="font-semibold">{participants.length}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso de vendas</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link to={`/ganhavel/${rifa.id}`}>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Ver Página da Rifa
              </Button>
            </Link>
            
            <ShareButton 
              url={`${window.location.origin}/ganhavel/${rifa.id}`}
              title={`Participe da minha rifa: ${rifa.title}`}
              description={rifa.description}
              variant="outline"
            />
            
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Link Copiado!" : "Copiar Link"}
            </Button>

            <GanhavesCancelButton
              ganhaveisId={rifa.id.toString()}
              ganhaveisTitle={rifa.title}
              participantCount={participants.length}
              isOwner={true}
              status={rifa.status}
            />
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="participants">Participantes</TabsTrigger>
              <TabsTrigger value="analytics">Estatísticas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Receita Total
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Taxa: R$ {platformFee.toFixed(2)} | Líquido: R$ {netRevenue.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Participantes
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{participants.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {rifa.soldTickets} bilhetes vendidos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Taxa de Conversão
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      {rifa.totalTickets - rifa.soldTickets} bilhetes restantes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {progress < 50 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Sua rifa tem baixo engajamento. Considere compartilhar mais nas redes sociais ou revisar o preço dos bilhetes.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Lista de Participantes</CardTitle>
                      <CardDescription>
                        {participants.length} participantes • {rifa.soldTickets} bilhetes vendidos
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Lista
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{participant.name}</h4>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Participou em {new Date(participant.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{participant.tickets} bilhetes</p>
                          <p className="text-sm text-muted-foreground">R$ {participant.totalPaid.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Detalhadas</CardTitle>
                  <CardDescription>
                    Análise do desempenho da sua rifa
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-primary">{rifa.soldTickets}</p>
                      <p className="text-sm text-muted-foreground">Bilhetes Vendidos</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">R$ {netRevenue.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Receita Líquida</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{(rifa.soldTickets / participants.length).toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Bilhetes por Pessoa</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{progress.toFixed(0)}%</p>
                      <p className="text-sm text-muted-foreground">Meta Atingida</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Rifa</CardTitle>
                  <CardDescription>
                    Gerencie as configurações e preferências
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Algumas configurações só podem ser alteradas antes da primeira venda.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Configurar Mensagens Automáticas
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Preferências de Compartilhamento
                    </Button>
                    
                    <Separator />
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-2 text-destructive">Zona de Perigo</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ações irreversíveis que afetarão todos os participantes.
                      </p>
                      
                      <GanhavesCancelButton
                        ganhaveisId={rifa.id.toString()}
                        ganhaveisTitle={rifa.title}
                        participantCount={participants.length}
                        isOwner={true}
                        status={rifa.status}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}