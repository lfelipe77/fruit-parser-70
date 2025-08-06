import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Clock, Users, Trophy, CheckCircle, MapPin } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { getProductSchema, getLotteryEventSchema, getBreadcrumbSchema } from "@/utils/structuredData";
import ShareButton from "@/components/ShareButton";
import DetalhesOrganizador from "@/components/DetalhesOrganizador";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { getGanhaveisById } from "@/data/ganhaveisData";
import Navigation from "@/components/Navigation";
import type { GanhaveisData } from "@/data/ganhaveisData";

// Function to get detailed organizer data for each ganhavel
const getOrganizerData = (rifa: GanhaveisData) => {
  const organizerProfiles: Record<string, any> = {
    "joaosilva": {
      name: rifa.organizer,
      username: rifa.organizerUsername,
      bio: "Especialista em rifas de veículos com mais de 5 anos de experiência. Formado em Administração, trabalha com concessionárias parceiras para garantir a entrega dos prêmios. Já organizou mais de 20 rifas bem-sucedidas.",
      location: rifa.location,
      memberSince: "Jan 2023",
      totalGanhaveisLancados: rifa.organizerGanhaveis,
      ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 0.95),
      totalGanhaveisParticipados: 89,
      ganhaveisGanhos: 12,
      avaliacaoMedia: rifa.organizerRating,
      totalAvaliacoes: 156,
      avatar: "/placeholder.svg",
      website: "https://concessionaria-saopaulo.com.br",
      socialLinks: {
        instagram: "@joaosilva_oficial",
        facebook: "joao.silva.ganhavel",
        linkedin: "joao-silva-ganhavel"
      }
    },
    "mariasantos": {
      name: rifa.organizer,
      username: rifa.organizerUsername,
      bio: "Especializada em eletrônicos e tecnologia. Trabalha em parceria com grandes redes varejistas para garantir produtos originais. Reconhecida pela pontualidade nas entregas e atendimento excepcional.",
      location: rifa.location,
      memberSince: "Mar 2023",
      totalGanhaveisLancados: rifa.organizerGanhaveis,
      ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 0.93),
      totalGanhaveisParticipados: 72,
      ganhaveisGanhos: 8,
      avaliacaoMedia: rifa.organizerRating,
      totalAvaliacoes: 98,
      avatar: "/placeholder.svg",
      website: "https://techstore-oficial.com.br",
      socialLinks: {
        instagram: "@maria_tech_rifas",
        facebook: "maria.santos.tech",
        twitter: "@mariasantos_tech"
      }
    },
    "carlosoliveira": {
      name: rifa.organizer,
      username: rifa.organizerUsername,
      bio: "Corretor de imóveis certificado e especialista em rifas de propriedades. Trabalha exclusivamente com imóveis de alto padrão em condomínios renomados. Membro da CRECI-SP há 8 anos.",
      location: rifa.location,
      memberSince: "Set 2022",
      totalGanhaveisLancados: rifa.organizerGanhaveis,
      ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 1.0),
      totalGanhaveisParticipados: 45,
      ganhaveisGanhos: 3,
      avaliacaoMedia: rifa.organizerRating,
      totalAvaliacoes: 67,
      avatar: "/placeholder.svg",
      website: "https://imobiliaria-alphaville.com.br",
      socialLinks: {
        instagram: "@carlos_imoveis",
        linkedin: "carlos-oliveira-corretor"
      }
    },
    "pedrocosta": {
      name: rifa.organizer,
      username: rifa.organizerUsername,
      bio: "Motociclista apaixonado e especialista em rifas de motos. Trabalha com concessionárias Yamaha e Honda autorizadas. Piloto nas horas vagas e organizador de eventos motociclísticos no Rio de Janeiro.",
      location: rifa.location,
      memberSince: "Jun 2023",
      totalGanhaveisLancados: rifa.organizerGanhaveis,
      ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 0.91),
      totalGanhaveisParticipados: 134,
      ganhaveisGanhos: 15,
      avaliacaoMedia: rifa.organizerRating,
      totalAvaliacoes: 89,
      avatar: "/placeholder.svg",
      website: "https://yamaha-rj.com.br",
      socialLinks: {
        instagram: "@pedro_motorbike",
        facebook: "pedro.costa.motos"
      }
    },
    "anasilva": {
      name: rifa.organizer,
      username: rifa.organizerUsername,
      bio: "Consultora financeira e especialista em rifas de dinheiro. Formada em Economia pela USP, ajuda pessoas a realizarem seus sonhos através de rifas transparentes e seguras. Parceira de bancos digitais.",
      location: rifa.location,
      memberSince: "Dez 2022",
      totalGanhaveisLancados: rifa.organizerGanhaveis,
      ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 0.97),
      totalGanhaveisParticipados: 203,
      ganhaveisGanhos: 22,
      avaliacaoMedia: rifa.organizerRating,
      totalAvaliacoes: 278,
      avatar: "/placeholder.svg",
      website: "https://consultoria-anasilva.com.br",
      socialLinks: {
        instagram: "@ana_consultora",
        linkedin: "ana-silva-consultora",
        twitter: "@anasilva_fin"
      }
    },
    "lucasferreira": {
      name: rifa.organizer,
      username: rifa.organizerUsername,
      bio: "Gamer profissional e especialista em rifas de consoles e setups. Streamer no Twitch com mais de 50k seguidores. Parceiro oficial da PlayStation e outras marcas de gaming.",
      location: rifa.location,
      memberSince: "Fev 2023",
      totalGanhaveisLancados: rifa.organizerGanhaveis,
      ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 0.89),
      totalGanhaveisParticipados: 167,
      ganhaveisGanhos: 11,
      avaliacaoMedia: rifa.organizerRating,
      totalAvaliacoes: 234,
      avatar: "/placeholder.svg",
      website: "https://lucasgamer.com.br",
      socialLinks: {
        instagram: "@lucasferreira_gamer",
        twitter: "@lucasgamerBR",
        facebook: "lucas.ferreira.gaming"
      }
    }
  };

  return organizerProfiles[rifa.organizerUsername] || {
    name: rifa.organizer,
    username: rifa.organizerUsername,
    bio: "Organizador verificado na Ganhavel com histórico comprovado de entregas pontuais e rifas bem-sucedidas.",
    location: rifa.location,
    memberSince: "Jan 2023",
    totalGanhaveisLancados: rifa.organizerGanhaveis,
    ganhaveisCompletos: Math.floor(rifa.organizerGanhaveis * 0.9),
    totalGanhaveisParticipados: 100,
    ganhaveisGanhos: 5,
    avaliacaoMedia: rifa.organizerRating,
    totalAvaliacoes: 50,
    avatar: "/placeholder.svg",
    socialLinks: {}
  };
};

export default function RifaDetail() {
  const [selectedCountry, setSelectedCountry] = useState("brasil");
  
  // Countries database with lottery information
  const countries = {
    brasil: {
      flag: "🇧🇷",
      name: "Brasil",
      lottery: "Loteria Federal",
      nextDraw: "Quarta-feira, 20:00"
    },
    usa: {
      flag: "🇺🇸", 
      name: "USA",
      lottery: "Powerball",
      nextDraw: "Segunda, 22:59"
    },
    uk: {
      flag: "🇬🇧",
      name: "UK", 
      lottery: "National Lottery",
      nextDraw: "Quarta, 19:45"
    },
    europa: {
      flag: "🇪🇺",
      name: "Europa",
      lottery: "EuroMillions", 
      nextDraw: "Sexta, 21:00"
    }
  };
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const navigate = useNavigate();
  const { id: rifaId } = useParams();
  
  const rifa = rifaId ? getGanhaveisById(rifaId) : null;

  if (!rifa) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Rifa não encontrada</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const percentage = Math.round((rifa.raised / rifa.goal) * 100);
  const isCompleted = percentage >= 100;

  const handleQuantityChange = (quantity: number) => {
    setSelectedQuantity(Math.max(1, Math.min(100, quantity))); // Limited to max 100 tickets
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(value);
  };

  const generateRandomNumbers = (quantity: number) => {
    const numbers = [];
    for (let i = 0; i < quantity; i++) {
      const combination = Array.from({ length: 6 }, () => 
        Math.floor(Math.random() * 90) + 10
      ).join('-');
      numbers.push(`(${combination})`);
    }
    return numbers;
  };

  const handlePurchase = () => {
    if (!rifaId) return;
    
    const selectedNumbers = generateRandomNumbers(selectedQuantity);
    const financialInstitutionFee = 2; // R$ 2,00 para instituição financeira
    const purchaseData = {
      rifaId,
      rifaTitle: rifa.title,
      rifaImage: rifa.image,
      selectedNumbers,
      quantity: selectedQuantity,
      unitPrice: rifa.ticketPrice,
      totalAmount: (rifa.ticketPrice * selectedQuantity) + financialInstitutionFee,
      organizerName: rifa.organizer
    };

    navigate(`/ganhavel/${rifaId}/confirmacao-pagamento`, {
      state: purchaseData
    });
  };

  const handleGoBack = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page if no history
      navigate('/');
    }
  };

  const breadcrumbItems = [
    { name: "Início", url: "https://ganhavel.com" },
    { name: "Categorias", url: "https://ganhavel.com/categorias" },
    { name: rifa.category, url: `https://ganhavel.com/categorias/${rifa.category.toLowerCase().replace(/\s+/g, '-')}` },
    { name: rifa.title, url: `https://ganhavel.com/ganhavel/${rifa.id}` }
  ];

  const structuredData = [
    getProductSchema(rifa),
    getLotteryEventSchema(rifa),
    getBreadcrumbSchema(breadcrumbItems)
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${rifa.title} - Rifa na Ganhavel | ${rifa.category}`}
        description={`${rifa.description} Participe desta rifa por apenas R$ ${rifa.ticketPrice}. Sorteio baseado na ${rifa.lotteryType}. Organizado por ${rifa.organizer}.`}
        canonical={`https://ganhavel.com/ganhavel/${rifa.id}`}
        ogImage={rifa.image}
        ogType="product"
        structuredData={structuredData}
      />
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold">Ganhavel</span>
              </Link>
            </div>
            
            
            <div className="flex items-center space-x-6">
              {/* Country Selection with Lottery Info - Hidden on mobile */}
              <div className="hidden lg:flex items-center space-x-4">
                {Object.entries(countries).map(([key, country]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCountry(key)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${
                      selectedCountry === key 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{country.name}</div>
                      <div className="text-xs text-muted-foreground">{country.lottery}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Selected Country Lottery Details - Hidden on mobile */}
              <div className="hidden xl:block text-sm text-muted-foreground border-l pl-4">
                <div>Próximo sorteio:</div>
                <div className="font-medium text-foreground">{countries[selectedCountry as keyof typeof countries].nextDraw}</div>
              </div>
              
              {/* Location - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 border-l pl-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-base font-semibold">{rifa.location}</span>
              </div>
              <Button variant="ghost" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-optimized container */}
      <div className="lg:container lg:mx-auto lg:px-4 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image and Basic Info */}
            <div className="space-y-4">
              <div className="relative overflow-hidden lg:rounded-lg">
                <img
                  src={rifa.image}
                  alt={rifa.title}
                  className="w-full h-[50vh] md:h-96 object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-foreground">
                  {rifa.category}
                </Badge>
                {isCompleted && (
                  <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                    Rifa Completa!
                  </Badge>
                )}
              </div>
              
              <div className="px-4 lg:px-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{rifa.title}</h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  {rifa.description}
                </p>
                
                {/* Share Section - Simplified on mobile */}
                <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-4 md:p-6 shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 items-center text-center">
                    <div className="w-full md:w-auto">
                      <ShareButton 
                        url={`${window.location.origin}/ganhavel/${rifaId}`}
                        title={`Confira esta rifa: ${rifa.title}`}
                        description={rifa.description}
                        variant="default"
                        size="lg"
                      />
                    </div>
                    <div className="text-lg md:text-xl font-semibold text-primary">
                      E faça o sonho acontecer
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs with Details */}
            <div className="px-4 lg:px-0">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Detalhes</TabsTrigger>
                  <TabsTrigger value="rules">Regulamento</TabsTrigger>
                </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Trophy className="w-5 h-5" />
                      <span>Detalhes do Prêmio</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Especificações</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Modelo: Honda Civic LX CVT 2024</li>
                          <li>• Cor: Preto</li>
                          <li>• Combustível: Flex</li>
                          <li>• Câmbio: Automático CVT</li>
                          <li>• Garantia: 3 anos de fábrica</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Documentação</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Nota fiscal em nome do ganhador</li>
                          <li>• IPVA 2024 pago</li>
                          <li>• Seguro obrigatório</li>
                          <li>• Manual do proprietário</li>
                          <li>• Chaves originais (2 unidades)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="rules" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Regulamento da Rifa</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6 text-sm">
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center space-x-2">
                          <span className="text-lg">🏆</span>
                          <span>COMO O GANHADOR É DEFINIDO</span>
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">1. Sorteio acontece</h5>
                            <p className="text-muted-foreground">
                              Utilizamos o número da Loteria Federal do país de origem do prêmio.
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">2. Comparação com os bilhetes vendidos</h5>
                            <p className="text-muted-foreground mb-2">
                              Se houver um bilhete com o número exato → esse é o ganhador.
                            </p>
                            <p className="text-muted-foreground">
                              Se nenhum tiver o número exato → o sistema identifica o mais próximo em ordem crescente.
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">3. Critério de desempate</h5>
                            <p className="text-muted-foreground">
                              Se dois ou mais bilhetes forem igualmente próximos, vence quem comprou primeiro.
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">4. Sem repetições</h5>
                            <p className="text-muted-foreground mb-2">
                              Cada bilhete é único no sistema.
                            </p>
                            <p className="text-muted-foreground">
                              Um número premiado não pode ser repetido em outro sorteio.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center space-x-2">
                          <span className="text-lg">✅</span>
                          <span>Garantia de Justiça</span>
                        </h4>
                        <p className="text-muted-foreground mb-4">
                          Essa lógica garante:
                        </p>
                        <ul className="text-muted-foreground space-y-2">
                          <li>• Sorteio 100% vinculado à Loteria Federal</li>
                          <li>• Zero manipulação</li>
                          <li>• Nenhuma fraude ou favorecimento</li>
                          <li>• Processo rastreável, seguro e auditável</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              </Tabs>
            </div>

            {/* Organizer Profile Section */}
            <div className="px-4 lg:px-0">
              <DetalhesOrganizador 
                organizer={getOrganizerData(rifa)}
              />
            </div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Participe do Ganhavel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      R$ {rifa.raised.toLocaleString()} arrecadados de R$ {rifa.goal.toLocaleString()}
                    </div>
                  </div>
                  <Progress value={percentage} className="h-3" />
                  <div className="text-center text-lg font-bold text-primary">
                    Sorteio: {percentage}% completo
                  </div>
                </div>

                {/* Draw Information */}
                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  <div className="space-y-1">
                    <div>🎯 Sorteio após arrecadação total</div>
                    <div>🏛️ {rifa.lotteryType}</div>
                  </div>
                </div>

                {/* Price and Quantity */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Bilhete</div>
                    <div className="text-2xl font-bold text-primary">
                      R$ {rifa.ticketPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Quantidade de bilhetes
                    </label>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuantityChange(selectedQuantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={selectedQuantity}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className="text-center text-lg font-semibold w-20"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleQuantityChange(selectedQuantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 py-2">
                    <div className="flex justify-between text-sm">
                      <span>Bilhetes ({selectedQuantity}x):</span>
                      <span>R$ {(rifa.ticketPrice * selectedQuantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Taxa institucional:</span>
                      <span>+ R$ 2,00</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total a pagar</span>
                        <span className="text-xl font-bold">
                          R$ {((rifa.ticketPrice * selectedQuantity) + 2).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Taxa institucional:</strong> R$ 2,00 destinados à instituição financeira para processamento e segurança dos pagamentos.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button 
                  variant={isCompleted ? "secondary" : "hero"} 
                  size="lg" 
                  className="w-full"
                  disabled={isCompleted}
                  onClick={handlePurchase}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Rifa Encerrada
                    </>
                  ) : (
                    `Comprar ${selectedQuantity} bilhete${selectedQuantity > 1 ? 's' : ''}`
                  )}
                </Button>

                {/* Lottery Security */}
                <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="font-medium">Loteria Federal – 100% seguro e transparente</span>
                  </div>
                  
                  {/* Direct Purchase Link */}
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Compre direto com o vendedor:
                      </span>
                      <a 
                        href={rifa.directPurchaseLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors"
                      >
                        {rifa.directPurchaseSite}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <h4 className="font-semibold">Por que confiar?</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Seguimos a Loteria Federal</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Organizador verificado</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span>Prêmio garantido</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}