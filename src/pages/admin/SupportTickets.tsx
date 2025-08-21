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
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
  Zap,
} from "lucide-react";

const ticketsData = [
  {
    id: "TK001",
    title: "Problema com pagamento - Rifa iPhone",
    user: "João Silva",
    userEmail: "joao@email.com",
    category: "pagamento",
    priority: "high",
    status: "open",
    created: "2024-01-15 14:30",
    lastUpdate: "2024-01-15 16:45",
    description: "O pagamento foi processado mas os números não apareceram na minha conta",
    rifaId: "RF001",
    responses: [
      {
        id: 1,
        author: "Suporte",
        message: "Olá João, estamos verificando sua transação. Pode nos enviar o comprovante?",
        timestamp: "2024-01-15 15:30",
        isAdmin: true,
      }
    ],
  },
  {
    id: "TK002",
    title: "Dúvida sobre sorteio",
    user: "Maria Santos",
    userEmail: "maria@email.com",
    category: "duvida",
    priority: "medium",
    status: "pending",
    created: "2024-01-14 10:15",
    lastUpdate: "2024-01-14 10:15",
    description: "Como funciona o sorteio? É ao vivo?",
    rifaId: "RF002",
    responses: [],
  },
  {
    id: "TK003",
    title: "Produto não foi entregue",
    user: "Carlos Mendes",
    userEmail: "carlos@email.com",
    category: "reclamacao",
    priority: "high",
    status: "investigating",
    created: "2024-01-13 09:20",
    lastUpdate: "2024-01-13 14:30",
    description: "Ganhei a rifa há 10 dias mas ainda não recebi o produto",
    rifaId: "RF003",
    responses: [
      {
        id: 1,
        author: "Suporte",
        message: "Estamos contatando o organizador da rifa para verificar o status da entrega.",
        timestamp: "2024-01-13 11:00",
        isAdmin: true,
      },
      {
        id: 2,
        author: "Carlos Mendes",
        message: "Obrigado, aguardo retorno.",
        timestamp: "2024-01-13 14:30",
        isAdmin: false,
      }
    ],
  },
];

export default function SupportTickets() {
  const [selectedTab, setSelectedTab] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newResponse, setNewResponse] = useState("");
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="text-blue-600 border-blue-200"><MessageSquare className="h-3 w-3 mr-1" />Aberto</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "investigating":
        return <Badge variant="outline" className="text-purple-600 border-purple-200"><AlertTriangle className="h-3 w-3 mr-1" />Investigando</Badge>;
      case "resolved":
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Resolvido</Badge>;
      case "closed":
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Fechado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>;
      case "medium":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Média</Badge>;
      case "low":
        return <Badge variant="outline" className="text-green-600 border-green-200">Baixa</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "pagamento":
        return <Badge variant="outline" className="text-red-600 border-red-200">Pagamento</Badge>;
      case "duvida":
        return <Badge variant="outline" className="text-blue-600 border-blue-200">Dúvida</Badge>;
      case "reclamacao":
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Reclamação</Badge>;
      case "tecnico":
        return <Badge variant="outline" className="text-purple-600 border-purple-200">Técnico</Badge>;
      default:
        return <Badge variant="outline">Outros</Badge>;
    }
  };

  const filteredTickets = ticketsData.filter((ticket) => {
    const matchesTab = selectedTab === "todos" || ticket.status === selectedTab;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todas" || ticket.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleResolveTicket = (ticketId: string) => {
    toast({
      title: "Ticket Resolvido",
      description: `O ticket ${ticketId} foi marcado como resolvido.`,
    });
  };

  const handleSendResponse = (ticketId: string, message: string) => {
    if (!message.trim()) return;
    
    toast({
      title: "Resposta Enviada",
      description: "Sua resposta foi enviada ao usuário.",
    });
    setNewResponse("");
  };

  const handleChangeStatus = (ticketId: string, newStatus: string) => {
    toast({
      title: "Status Alterado",
      description: `O ticket foi alterado para ${newStatus}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sistema de Suporte</h1>
        <p className="text-muted-foreground">
          Gerencie tickets de suporte e atendimento ao cliente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsData.length}</div>
            <p className="text-xs text-muted-foreground">+8% esta semana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketsData.filter(t => t.status === "open").length}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando resposta</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ticketsData.filter(t => t.priority === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">Requer atenção urgente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">Tempo de resposta</p>
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
                  placeholder="Buscar por título, usuário ou ID..."
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
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="duvida">Dúvidas</SelectItem>
                  <SelectItem value="reclamacao">Reclamações</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tickets</CardTitle>
          <CardDescription>
            {filteredTickets.length} tickets encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="open">Abertos</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="investigating">Investigando</TabsTrigger>
              <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value={selectedTab} className="mt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Atualização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium truncate">{ticket.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Rifa: {ticket.rifaId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ticket.user}</div>
                            <div className="text-sm text-muted-foreground">{ticket.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(ticket.category)}</TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell className="text-sm">{ticket.lastUpdate}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Ticket {selectedTicket?.id} - {selectedTicket?.title}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Gerenciar ticket de suporte
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTicket && (
                                  <div className="space-y-6">
                                    {/* Ticket Info */}
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <Label>Usuário</Label>
                                        <p className="text-sm font-medium">{selectedTicket.user}</p>
                                        <p className="text-sm text-muted-foreground">{selectedTicket.userEmail}</p>
                                      </div>
                                      <div>
                                        <Label>Rifa Relacionada</Label>
                                        <p className="text-sm">{selectedTicket.rifaId}</p>
                                      </div>
                                      <div>
                                        <Label>Categoria</Label>
                                        <div>{getCategoryBadge(selectedTicket.category)}</div>
                                      </div>
                                      <div>
                                        <Label>Prioridade</Label>
                                        <div>{getPriorityBadge(selectedTicket.priority)}</div>
                                      </div>
                                      <div>
                                        <Label>Status</Label>
                                        <div>{getStatusBadge(selectedTicket.status)}</div>
                                      </div>
                                      <div>
                                        <Label>Criado em</Label>
                                        <p className="text-sm">{selectedTicket.created}</p>
                                      </div>
                                    </div>

                                    {/* Original Message */}
                                    <div className="border rounded-lg p-4">
                                      <Label>Descrição do Problema</Label>
                                      <p className="text-sm mt-2">{selectedTicket.description}</p>
                                    </div>

                                    {/* Conversation */}
                                    <div className="space-y-4">
                                      <Label>Histórico de Conversas</Label>
                                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                                        {selectedTicket.responses.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">Nenhuma resposta ainda</p>
                                        ) : (
                                          selectedTicket.responses.map((response) => (
                                            <div 
                                              key={response.id}
                                              className={`p-3 rounded-md ${
                                                response.isAdmin 
                                                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                                                  : 'bg-gray-50 border-l-4 border-gray-300'
                                              }`}
                                            >
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">{response.author}</span>
                                                <span className="text-xs text-muted-foreground">{response.timestamp}</span>
                                                {response.isAdmin && (
                                                  <Badge variant="outline" className="text-blue-600">Admin</Badge>
                                                )}
                                              </div>
                                              <p className="text-sm">{response.message}</p>
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                      <Select onValueChange={(value) => handleChangeStatus(selectedTicket.id, value)}>
                                        <SelectTrigger className="w-40">
                                          <SelectValue placeholder="Alterar Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="open">Aberto</SelectItem>
                                          <SelectItem value="investigating">Investigando</SelectItem>
                                          <SelectItem value="pending">Pendente</SelectItem>
                                          <SelectItem value="resolved">Resolvido</SelectItem>
                                          <SelectItem value="closed">Fechado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      
                                      <Button 
                                        variant="outline"
                                        onClick={() => handleResolveTicket(selectedTicket.id)}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Resolver
                                      </Button>
                                    </div>

                                    {/* Response Form */}
                                    <div className="space-y-3">
                                      <Label>Responder ao Ticket</Label>
                                      <Textarea
                                        value={newResponse}
                                        onChange={(e) => setNewResponse(e.target.value)}
                                        placeholder="Digite sua resposta aqui..."
                                        rows={4}
                                      />
                                    </div>
                                  </div>
                                )}
                                <DialogFooter>
                                  <Button variant="outline">Fechar</Button>
                                  <Button 
                                    onClick={() => handleSendResponse(selectedTicket?.id, newResponse)}
                                    disabled={!newResponse.trim()}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Enviar Resposta
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {ticket.status !== "resolved" && ticket.status !== "closed" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleResolveTicket(ticket.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
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