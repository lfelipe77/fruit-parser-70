import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Trophy, 
  Package, 
  CreditCard, 
  MessageCircle, 
  FileImage, 
  Download,
  Search,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Star,
  FileText,
  Camera
} from "lucide-react";

// Mock data for completed ganhaveis
const completedGanhaveis = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    image: "/placeholder.svg",
    totalTickets: 100,
    price: 15.00,
    totalRevenue: 1500.00,
    completedDate: "2024-03-20",
    winner: {
      id: "user1",
      name: "João Silva Santos",
      email: "joao.santos@email.com",
      phone: "+55 11 99999-9999",
      address: "Rua das Flores, 123 - São Paulo, SP",
      avatar: "/placeholder.svg",
      ticketNumber: "00047"
    },
    organizer: {
      id: "org1",
      name: "Tech Store",
      email: "contato@techstore.com",
      rating: 4.8
    },
    status: "entregue", // sorteado, aguardando_pagamento, pago, enviado, entregue
    paymentStatus: "pago",
    deliveryStatus: "entregue",
    proofOfDelivery: {
      hasProof: true,
      images: ["proof1.jpg", "proof2.jpg"],
      deliveryDate: "2024-03-25",
      trackingCode: "BR123456789"
    },
    communication: [
      {
        id: "1",
        from: "organizer",
        message: "Parabéns! Você ganhou o iPhone 15 Pro Max! Por favor, confirme seus dados para envio.",
        timestamp: "2024-03-20 14:30",
        type: "winner_notification"
      },
      {
        id: "2",
        from: "winner",
        message: "Obrigado! Confirmo todos os dados. Aguardo instruções para recebimento.",
        timestamp: "2024-03-20 15:45",
        type: "response"
      },
      {
        id: "3",
        from: "organizer",
        message: "Produto enviado via Correios. Código de rastreamento: BR123456789",
        timestamp: "2024-03-22 10:15",
        type: "shipping_notification"
      }
    ],
    warranty: {
      hasWarranty: true,
      duration: "12 meses",
      type: "Garantia do fabricante",
      details: "Garantia Apple de 12 meses a partir da data de entrega"
    }
  },
  {
    id: "2",
    title: "Honda Civic 2024 0KM",
    image: "/placeholder.svg",
    totalTickets: 5000,
    price: 100.00,
    totalRevenue: 500000.00,
    completedDate: "2024-03-15",
    winner: {
      id: "user2",
      name: "Maria Oliveira",
      email: "maria.oliveira@email.com",
      phone: "+55 21 88888-8888",
      address: "Av. Paulista, 1000 - Rio de Janeiro, RJ",
      avatar: "/placeholder.svg",
      ticketNumber: "02847"
    },
    organizer: {
      id: "org2",
      name: "Auto Rifas",
      email: "contato@autorifas.com",
      rating: 4.9
    },
    status: "pago",
    paymentStatus: "pago",
    deliveryStatus: "aguardando_entrega",
    proofOfDelivery: {
      hasProof: false,
      images: [],
      deliveryDate: null,
      trackingCode: null
    },
    communication: [
      {
        id: "1",
        from: "organizer",
        message: "Parabéns Maria! Você ganhou o Honda Civic 2024! Vamos agendar a entrega.",
        timestamp: "2024-03-15 16:20",
        type: "winner_notification"
      }
    ],
    warranty: {
      hasWarranty: true,
      duration: "36 meses",
      type: "Garantia de fábrica",
      details: "Garantia Honda de 3 anos ou 100.000km"
    }
  }
];

const GanhaveisDetailModal = ({ ganhavel, open, onOpenChange }: any) => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {ganhavel.title}
          </DialogTitle>
          <DialogDescription>
            Ganhavel concluído em {new Date(ganhavel.completedDate).toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="winner">Ganhador</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="delivery">Entrega</TabsTrigger>
            <TabsTrigger value="communication">Comunicação</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] w-full">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informações do Ganhavel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de Bilhetes:</span>
                      <span className="font-medium">{ganhavel.totalTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço do Bilhete:</span>
                      <span className="font-medium">R$ {ganhavel.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Receita Total:</span>
                      <span className="font-medium text-green-600">R$ {ganhavel.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data do Sorteio:</span>
                      <span className="font-medium">{new Date(ganhavel.completedDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Ganhavel:</span>
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pagamento:</span>
                      <Badge variant={ganhavel.paymentStatus === "pago" ? "default" : "secondary"}>
                        {ganhavel.paymentStatus === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Entrega:</span>
                      <Badge variant={ganhavel.deliveryStatus === "entregue" ? "default" : "secondary"}>
                        {ganhavel.deliveryStatus === "entregue" ? "Entregue" : "Pendente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {ganhavel.warranty.hasWarranty && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Garantia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tipo:</span>
                        <span className="font-medium">{ganhavel.warranty.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duração:</span>
                        <span className="font-medium">{ganhavel.warranty.duration}</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {ganhavel.warranty.details}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="winner" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Ganhador
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={ganhavel.winner.avatar} />
                      <AvatarFallback>{ganhavel.winner.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{ganhavel.winner.name}</h3>
                        <p className="text-muted-foreground">Bilhete nº {ganhavel.winner.ticketNumber}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{ganhavel.winner.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{ganhavel.winner.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{ganhavel.winner.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Detalhes do Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status do Pagamento</Label>
                      <Badge variant={ganhavel.paymentStatus === "pago" ? "default" : "secondary"} className="mt-1">
                        {ganhavel.paymentStatus === "pago" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                    <div>
                      <Label>Valor do Prêmio</Label>
                      <p className="text-lg font-semibold">R$ {ganhavel.totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label>Dados do Ganhador para Pagamento</Label>
                    <div className="mt-2 space-y-2 text-sm">
                      <p><strong>Nome:</strong> {ganhavel.winner.name}</p>
                      <p><strong>Email:</strong> {ganhavel.winner.email}</p>
                      <p><strong>Telefone:</strong> {ganhavel.winner.phone}</p>
                      <p className="text-muted-foreground">
                        Dados bancários devem ser coletados via comunicação privada.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Status de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={ganhavel.deliveryStatus === "entregue" ? "default" : "secondary"}>
                      {ganhavel.deliveryStatus === "entregue" ? "Entregue" : "Aguardando Entrega"}
                    </Badge>
                  </div>
                  
                  {ganhavel.proofOfDelivery.trackingCode && (
                    <div>
                      <Label>Código de Rastreamento</Label>
                      <p className="font-mono text-sm mt-1">{ganhavel.proofOfDelivery.trackingCode}</p>
                    </div>
                  )}
                  
                  {ganhavel.proofOfDelivery.hasProof && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Comprovantes de Entrega
                      </Label>
                      <div className="mt-2 flex gap-2">
                        {ganhavel.proofOfDelivery.images.map((image, index) => (
                          <Button key={index} variant="outline" size="sm">
                            <FileImage className="h-4 w-4 mr-2" />
                            Foto {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {ganhavel.proofOfDelivery.deliveryDate && (
                    <div>
                      <Label>Data de Entrega</Label>
                      <p className="text-sm mt-1">
                        {new Date(ganhavel.proofOfDelivery.deliveryDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Histórico de Comunicação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      {ganhavel.communication.map((msg: any) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.from === 'winner' ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.from === 'organizer' ? 'O' : 'G'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`flex-1 ${msg.from === 'winner' ? 'text-right' : ''}`}>
                            <div className={`rounded-lg p-3 ${
                              msg.from === 'winner' 
                                ? 'bg-primary text-primary-foreground ml-8' 
                                : 'bg-muted mr-8'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-xs mt-1 ${
                                msg.from === 'winner' 
                                  ? 'text-primary-foreground/70' 
                                  : 'text-muted-foreground'
                              }`}>
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <Label>Nova Mensagem</Label>
                    <Textarea placeholder="Digite sua mensagem..." />
                    <Button size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default function GanhaveisComcluidos() {
  const [selectedGanhavel, setSelectedGanhavel] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGanhaveis = completedGanhaveis.filter(ganhavel =>
    ganhavel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ganhavel.winner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (ganhavel: any) => {
    setSelectedGanhavel(ganhavel);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'sorteado': { variant: 'secondary' as const, label: 'Sorteado' },
      'aguardando_pagamento': { variant: 'destructive' as const, label: 'Aguardando Pagamento' },
      'pago': { variant: 'default' as const, label: 'Pago' },
      'enviado': { variant: 'default' as const, label: 'Enviado' },
      'entregue': { variant: 'default' as const, label: 'Entregue' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { variant: 'secondary' as const, label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ganhaveis Concluídos</h1>
          <p className="text-muted-foreground">
            Gerencie ganhaveis sorteados, pagamentos e entregas
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por título do ganhavel ou nome do ganhador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedGanhaveis.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Entrega</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedGanhaveis.filter(r => r.deliveryStatus !== 'entregue').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {completedGanhaveis.reduce((acc, r) => acc + r.totalRevenue, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedGanhaveis.filter(r => r.deliveryStatus === 'entregue').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Raffles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ganhaveis Concluídos</CardTitle>
          <CardDescription>
            Acompanhe o status de pagamentos, entregas e comunicação com ganhadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ganhavel</TableHead>
                <TableHead>Ganhador</TableHead>
                <TableHead>Bilhete</TableHead>
                <TableHead>Data Sorteio</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGanhaveis.map((ganhavel) => (
                <TableRow key={ganhavel.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img 
                        src={ganhavel.image} 
                        alt={ganhavel.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{ganhavel.title}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {ganhavel.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={ganhavel.winner.avatar} />
                        <AvatarFallback>
                          {ganhavel.winner.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{ganhavel.winner.name}</p>
                        <p className="text-sm text-muted-foreground">{ganhavel.winner.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">#{ganhavel.winner.ticketNumber}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(ganhavel.completedDate).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ganhavel.paymentStatus)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ganhavel.deliveryStatus)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(ganhavel)}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedGanhavel && (
        <GanhaveisDetailModal
          ganhavel={selectedGanhavel}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}