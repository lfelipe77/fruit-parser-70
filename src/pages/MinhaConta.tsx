import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ShareButton from "@/components/ShareButton";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Trophy, 
  Heart, 
  Settings,
  CreditCard,
  Shield,
  Bell,
  Camera,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Share2,
  Plus,
  ChevronDown,
  ChevronUp,
  Gift,
  Send,
  Clock
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MinhaConta() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [expandedRifas, setExpandedRifas] = useState<number[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("minhas-rifas");
  const [profileFormData, setProfileFormData] = useState({
    name: "João Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    address: "São Paulo, SP",
    bio: "Empreendedor apaixonado por tecnologia e inovação. Ajudo pequenos negócios a crescerem através de rifas justas e transparentes.",
    website: "https://joaosilva.com.br",
    instagram: "@joaosilva_oficial",
    facebook: "João Silva Oficial",
    twitter: "@joaosilva",
    linkedin: "joao-silva-empresario"
  });

  // Handle URL tab parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Mock user data
  const user = {
    name: profileFormData.name,
    username: "joaosilva",
    email: profileFormData.email,
    phone: profileFormData.phone,
    cpf: "***.***.***-99",
    address: profileFormData.address,
    memberSince: "Janeiro 2024",
    totalRifas: 15,
    totalRifasLancadas: 8,
    wins: 2,
    avatar: "",
    bio: profileFormData.bio,
    website: profileFormData.website,
    socialLinks: {
      instagram: profileFormData.instagram,
      facebook: profileFormData.facebook,
      twitter: profileFormData.twitter,
      linkedin: profileFormData.linkedin
    }
  };

  // Generate lottery combinations (3 pairs of two-digit numbers each, grouped in parentheses)
  const generateLotteryCombination = () => {
    const numbers = [];
    for (let i = 0; i < 6; i++) {
      const num = String(Math.floor(Math.random() * 89) + 10).padStart(2, '0');
      numbers.push(num);
    }
    return `(${numbers.join('-')})`;
  };

  const generateManyCombinations = (count: number) => {
    return Array.from({ length: count }, () => generateLotteryCombination());
  };

  const recentRifas = [
    { 
      id: 1, 
      title: "iPhone 15 Pro Max", 
      numbers: generateManyCombinations(100), // Maximum 100 combinations limit
      status: "Em andamento", 
      image: "/placeholder.svg",
      totalPaid: 500 // 100 combinations x 5 reais (maximum allowed)
    },
    { 
      id: 2, 
      title: "Honda Civic 2024", 
      numbers: [
        "(12-43-24-56-78-90)",
        "(34-67-89-12-45-78)",
        "(56-89-23-45-67-34)"
      ], 
      status: "Finalizada", 
      image: "/src/assets/honda-civic-2024.jpg",
      totalPaid: 15 // 3 combinations x 5 reais
    },
    { 
      id: 3, 
      title: "R$ 50.000", 
      numbers: [
        "(11-22-33-44-55-66)",
        "(45-67-89-23-56-78)"
      ],
      status: "Vencedor!", 
      image: "/placeholder.svg",
      totalPaid: 10 // 2 combinations x 5 reais
    },
  ];

  const toggleExpanded = (rifaId: number) => {
    setExpandedRifas(prev => 
      prev.includes(rifaId) 
        ? prev.filter(id => id !== rifaId)
        : [...prev, rifaId]
    );
  };

  const NumbersDisplay = ({ rifa }: { rifa: typeof recentRifas[0] }) => {
    const isExpanded = expandedRifas.includes(rifa.id);
    const shouldShowExpandButton = rifa.numbers.length > 2;
    const displayNumbers = isExpanded ? rifa.numbers : rifa.numbers.slice(0, 2);

    return (
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Combinações (3 pares de 2 números): </span>
        </div>
        
        <div className="space-y-1">
          {displayNumbers.map((combination, index) => (
            <div key={index} className="text-xs font-mono bg-muted p-2 rounded border break-all">
              {combination}
            </div>
          ))}
        </div>
        
        {!isExpanded && shouldShowExpandButton && (
          <div className="text-xs text-muted-foreground">
            ... e mais {rifa.numbers.length - 2} combinações
          </div>
        )}
        
        {shouldShowExpandButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpanded(rifa.id);
            }}
            className="h-6 px-2 text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Ver todas ({rifa.numbers.length} combinações)
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const rifasLancadas = [
    { id: 1, title: "PS5 Setup Gamer", numbers: "100", status: "Em andamento", image: "/placeholder.svg", vendidos: 75, precoUnitario: 5, totalPossivel: 500 },
    { id: 2, title: "Yamaha MT-03 2024", numbers: "150", status: "Finalizada", image: "/placeholder.svg", vendidos: 150, precoUnitario: 5, totalPossivel: 750 },
  ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Track which fields were updated
      const updatedFields: string[] = [];
      const originalData = {
        name: "João Silva",
        email: "joao@email.com",
        phone: "(11) 99999-9999",
        address: "São Paulo, SP",
        bio: "Empreendedor apaixonado por tecnologia e inovação. Ajudo pequenos negócios a crescerem através de rifas justas e transparentes.",
        website: "https://joaosilva.com.br",
        instagram: "@joaosilva_oficial",
        facebook: "João Silva Oficial",
        twitter: "@joaosilva",
        linkedin: "joao-silva-empresario"
      };

      Object.keys(profileFormData).forEach(key => {
        if (profileFormData[key as keyof typeof profileFormData] !== originalData[key as keyof typeof originalData]) {
          updatedFields.push(key);
        }
      });

      // Log audit event for profile update
      if (updatedFields.length > 0) {
        const { error: auditError } = await (supabase as any).rpc('log_audit_event', {
          action: 'updated_user_profile',
          context: {
            page: 'MinhaConta',
            updated_fields: updatedFields
          }
        });

        if (auditError) {
          console.error('Error logging audit event:', auditError);
        }
      }

      // TODO: Update profile with Supabase
      setIsEditingProfile(false);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao salvar suas informações. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="md:ml-auto">
                  <ShareButton 
                    url={`${window.location.origin}/perfil/${user.username}`}
                    title={`Confira o perfil de ${user.name} na Ganhavel!`}
                    variant="outline"
                    size="sm"
                  />
                </div>
                
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Membro desde {user.memberSince}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{user.wins} vitórias</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{user.totalRifas} rifas participadas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Plus className="h-4 w-4 text-blue-500" />
                      <span>{user.totalRifasLancadas} rifas lançadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="minhas-rifas">Meus Ganhaveis</TabsTrigger>
              <TabsTrigger value="rifas-lancadas">Ganhaveis Lançados</TabsTrigger>
              <TabsTrigger value="clamar-premio">Clamar Prêmio</TabsTrigger>
              <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            </TabsList>

            {/* Minhas Rifas Tab */}
            <TabsContent value="minhas-rifas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ganhaveis Participados</CardTitle>
                  <CardDescription>
                    Acompanhe suas participações e resultados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRifas.map((rifa) => (
                      <Link to={`/ganhavel/${rifa.id}`} key={rifa.id} className="block">
                        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <img 
                            src={rifa.image} 
                            alt={rifa.title} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold hover:text-primary transition-colors">{rifa.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Total investido: R$ {rifa.totalPaid}
                            </p>
                            <NumbersDisplay rifa={rifa} />
                          </div>
                          <Badge 
                            variant={
                              rifa.status === "Vencedor!" ? "default" : 
                              rifa.status === "Em andamento" ? "secondary" : "outline"
                            }
                          >
                            {rifa.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rifas Lançadas Tab */}
            <TabsContent value="rifas-lancadas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ganhaveis que Você Lançou</CardTitle>
                  <CardDescription>
                    Gerencie seus ganhaveis organizados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nenhum ganhavel lançado ainda
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Comece criando seu primeiro ganhavel para começar a arrecadar fundos.
                    </p>
                    <Button asChild>
                      <Link to="/lance-seu-ganhavel">Lançar Ganhavel</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clamar Prêmio Tab */}
            <TabsContent value="clamar-premio" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Clamar Prêmios
                  </CardTitle>
                  <CardDescription>
                    Ganhaveis que você ganhou e podem ser clamados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentRifas
                      .filter(rifa => rifa.status === "Vencedor!")
                      .map((rifa) => (
                        <div key={rifa.id} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-start gap-4">
                            <img 
                              src={rifa.image} 
                              alt={rifa.title} 
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-green-800 dark:text-green-200">{rifa.title}</h3>
                              <p className="text-sm text-green-600 dark:text-green-300 mb-3">
                                🎉 Parabéns! Você ganhou este prêmio!
                              </p>
                              <div className="space-y-3">
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <Label htmlFor={`nome-${rifa.id}`} className="text-sm">Nome completo para entrega</Label>
                                    <Input id={`nome-${rifa.id}`} placeholder="Seu nome completo" />
                                  </div>
                                  <div>
                                    <Label htmlFor={`email-${rifa.id}`} className="text-sm">Email (para produtos digitais)</Label>
                                    <Input id={`email-${rifa.id}`} type="email" placeholder="seu@email.com" />
                                  </div>
                                  <div>
                                    <Label htmlFor={`telefone-${rifa.id}`} className="text-sm">Telefone</Label>
                                    <Input id={`telefone-${rifa.id}`} placeholder="(11) 99999-9999" />
                                  </div>
                                  <div>
                                    <Label htmlFor={`whatsapp-${rifa.id}`} className="text-sm">WhatsApp</Label>
                                    <Input id={`whatsapp-${rifa.id}`} placeholder="(11) 99999-9999" />
                                  </div>
                                  <div className="md:col-span-2">
                                    <Label htmlFor={`endereco-${rifa.id}`} className="text-sm">Endereço completo</Label>
                                    <Input id={`endereco-${rifa.id}`} placeholder="Rua, número, bairro, cidade, CEP" />
                                  </div>
                                </div>
                                <Button className="w-full md:w-auto">
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar Dados ao Organizador
                                </Button>
                              </div>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                              Prêmio Ganho
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {recentRifas.filter(rifa => rifa.status === "Vencedor!").length === 0 && (
                      <div className="text-center py-8">
                        <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum prêmio para clamar no momento</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pagamentos Tab */}
            <TabsContent value="pagamentos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Ganhaveis para Pagamento
                  </CardTitle>
                  <CardDescription>
                    Organize pagamentos e entregas dos seus ganhaveis vendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rifasLancadas
                      .filter(rifa => rifa.status === "Finalizada")
                      .map((rifa) => (
                        <div key={rifa.id} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-4">
                            <img 
                              src={rifa.image} 
                              alt={rifa.title} 
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{rifa.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                Arrecadado: R$ {rifa.vendidos * rifa.precoUnitario}
                              </p>
                              <div className="space-y-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Vencedor:</h4>
                                  <p className="text-sm text-blue-600 dark:text-blue-300">Maria Santos - (11) 98765-4321</p>
                                  <p className="text-sm text-blue-600 dark:text-blue-300">Rua das Flores, 123 - São Paulo, SP</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Agendar Entrega
                                  </Button>
                                  <Button size="sm">
                                    <Send className="h-4 w-4 mr-2" />
                                    Confirmar Pagamento
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              Aguardando Pagamento
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {rifasLancadas.filter(rifa => rifa.status === "Finalizada").length === 0 && (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum pagamento pendente no momento</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Online Payments Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Pagamentos Online
                  </CardTitle>
                  <CardDescription>
                    Status dos pagamentos automáticos processados online
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock online payment data */}
                    {[
                      {
                        id: 1,
                        title: "iPhone 15 Pro Max",
                        image: "/placeholder.svg",
                        amount: 2500,
                        status: "paid",
                        paymentId: "pay_1O2K3L4M5N6P7Q8R",
                        date: "2024-01-15"
                      },
                      {
                        id: 2,
                        title: "PlayStation 5 + Setup Gamer",
                        image: "/placeholder.svg",
                        amount: 1800,
                        status: "in_progress",
                        paymentId: "pay_2P3Q4R5S6T7U8V9W",
                        date: "2024-01-14"
                      }
                    ].map((payment) => (
                      <div key={payment.id} className="p-4 border rounded-lg">
                        <div className="flex items-start gap-4">
                          <img 
                            src={payment.image} 
                            alt={payment.title} 
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{payment.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Valor: R$ {payment.amount.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              ID: {payment.paymentId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Data: {new Date(payment.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge 
                            variant={payment.status === "paid" ? "default" : "secondary"}
                            className={payment.status === "paid" ? "bg-green-600" : ""}
                          >
                            {payment.status === "paid" ? "Pago" : "Em Progresso"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {/* Empty state could be shown here if no payments */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Perfil Tab */}
            <TabsContent value="perfil" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>
                        Mantenha seus dados atualizados
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {isEditingProfile ? "Cancelar" : "Editar Perfil"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input
                            id="name"
                            value={profileFormData.name}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileFormData.email}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input
                            id="phone"
                            value={profileFormData.phone}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input
                            id="address"
                            value={profileFormData.address}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Descrição/Bio</Label>
                          <Input
                            id="bio"
                            value={profileFormData.bio}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, bio: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={profileFormData.website}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, website: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="instagram">Instagram</Label>
                          <Input
                            id="instagram"
                            value={profileFormData.instagram}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, instagram: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="facebook">Facebook</Label>
                          <Input
                            id="facebook"
                            value={profileFormData.facebook}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, facebook: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="twitter">Twitter/X</Label>
                          <Input
                            id="twitter"
                            value={profileFormData.twitter}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, twitter: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={profileFormData.linkedin}
                            onChange={(e) => setProfileFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button type="submit">
                          Salvar Alterações
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.email}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.phone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.cpf}</span>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.address}</span>
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-sm font-medium text-muted-foreground">Descrição/Bio</Label>
                          <div className="p-3 bg-muted rounded-lg border">
                            <span className="font-medium leading-relaxed">{user.bio}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Website</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-primary underline">{user.website}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Instagram</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Instagram className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.socialLinks.instagram}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Facebook</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Facebook className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.socialLinks.facebook}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Twitter/X</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Twitter className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.socialLinks.twitter}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">LinkedIn</Label>
                          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
                            <Linkedin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.socialLinks.linkedin}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações Tab */}
            <TabsContent value="configuracoes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências</CardTitle>
                  <CardDescription>
                    Configure suas preferências de conta
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <Label>Notificações por Email</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações sobre suas rifas
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <Label>Notificações Push</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações no navegador
                      </p>
                    </div>
                    <input type="checkbox" className="rounded" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <Label>Newsletter</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Receba ofertas e novidades
                      </p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Segurança Tab */}
            <TabsContent value="seguranca" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-500" />
                          <Label>Alterar Senha</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Última alteração há 3 meses
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/alterar-senha")}
                      >
                        Alterar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <Label>Métodos de Pagamento</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Cartões salvos e PIX
                        </p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/gerenciar-cartoes-e-pix")}
                      >
                        Gerenciar
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          <Label>Excluir Conta</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Ação permanente e irreversível
                        </p>
                      </div>
                      <Button variant="destructive">
                        Excluir
                      </Button>
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
