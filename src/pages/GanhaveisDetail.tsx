import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Clock, Users, Trophy, CheckCircle, MapPin, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ShareButton from "@/components/ShareButton";
import DetalhesOrganizador from "@/components/DetalhesOrganizador";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Types for our Supabase data
type RaffleData = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  ticket_price: number;
  total_tickets: number;
  paid_tickets: number;
  tickets_remaining: number;
  amount_collected: number;
  goal_amount: number;
  progress_pct: number;
  status: string;
  category_id: number;
  owner_user_id: string;
  vendor_link?: string;
  lottery_type?: string;
};

type ProfileData = {
  id: string;
  display_name?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  created_at: string;
};

export default function RifaDetail() {
  const [selectedCountry, setSelectedCountry] = useState("brasil");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const selectedProvider = "asaas"; // Fixed to Asaas only
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [rifa, setRifa] = useState<RaffleData | null>(null);
  const [organizer, setOrganizer] = useState<ProfileData | null>(null);
  
  const navigate = useNavigate();
  const { id: rifaId } = useParams();
  const { user } = useAuth();
  
  // Countries database with lottery information
  const countries = {
    brasil: {
      flag: "🇧🇷",
      name: "Brasil",
      lottery: "Loteria Federal",
      nextDraw: "—"
    },
    usa: {
      flag: "🇺🇸", 
      name: "USA",
      lottery: "Powerball",
      nextDraw: "—"
    },
    uk: {
      flag: "🇬🇧",
      name: "UK", 
      lottery: "National Lottery",
      nextDraw: "—"
    },
    europa: {
      flag: "🇪🇺",
      name: "Europa",
      lottery: "EuroMillions", 
      nextDraw: "—"
    }
  };

  // Fetch raffle data
  useEffect(() => {
    if (!rifaId) return;

    const fetchRaffle = async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('raffles_public_ext')
          .select('id,title,description,image_url,ticket_price,total_tickets,paid_tickets,progress_pct,category_name,subcategory_name,draw_date,status,category_id,subcategory_id,owner_user_id,amount_collected,goal_amount,tickets_remaining')
          .eq('id', rifaId)
          .maybeSingle();

        if (error) throw error;
        setRifa(data);

        // Fetch organizer if raffle found
        if (data?.owner_user_id) {
          const { data: organizerData } = await supabase
            .from('user_profiles')
            .select('id, display_name, username, full_name, avatar_url, bio, location, created_at')
            .eq('id', data.owner_user_id)
            .maybeSingle();
          
          setOrganizer(organizerData);
        }
      } catch (error) {
        console.error('Error fetching raffle:', error);
        toast.error('Erro ao carregar rifa');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffle();
  }, [rifaId]);

  // Realtime subscription for ticket updates
  useEffect(() => {
    if (!rifaId) return;

    const channel = supabase
      .channel(`raffle-tickets-${rifaId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tickets', 
        filter: `raffle_id=eq.${rifaId}` 
      }, async () => {
        // Re-fetch raffle data when tickets change
        const { data } = await (supabase as any)
          .from('raffles_public_ext')
          .select('paid_tickets,tickets_remaining,amount_collected,progress_pct')
          .eq('id', rifaId)
          .maybeSingle();
        
        if (data && rifa) {
          setRifa(prev => prev ? { ...prev, ...data } : null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rifaId, rifa]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!rifa) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Ganhavel não encontrado</h1>
            <p className="text-muted-foreground mb-4">Verifique o link ou explore outros Ganhavéis.</p>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para a Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const percentage = Math.round(rifa.progress_pct || 0);
  const isCompleted = percentage >= 100;
  const isSoldOut = (rifa.tickets_remaining || 0) <= 0;
  const canPurchase = rifa.status === 'approved' && !isCompleted && !isSoldOut;

  // Calculate purchase totals
  const subtotal = selectedQuantity * rifa.ticket_price;
  const fee = selectedProvider === 'asaas' ? 2.00 : 0;
  const total = subtotal + fee;

  const handleQuantityChange = (quantity: number) => {
    setSelectedQuantity(Math.max(1, Math.min(100, quantity))); // Limited to max 100 tickets
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(value);
  };

  const handlePurchase = async () => {
    if (!rifaId || !user || !canPurchase) {
      if (!user) {
        toast.error('Entre para comprar bilhetes');
        navigate('/login');
        return;
      }
      return;
    }

    setPurchasing(true);
    try {
      // 1. Reserve tickets
      const { data: ticketNumbers, error: reserveError } = await supabase
        .rpc('reserve_tickets', {
          p_raffle_id: rifaId,
          p_qty: selectedQuantity
        });

      if (reserveError) throw reserveError;
      if (!ticketNumbers || ticketNumbers.length === 0) {
        toast.error('Não há bilhetes disponíveis');
        return;
      }

      // 2. Create checkout
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          provider: selectedProvider,
          raffle_id: rifaId,
          qty: selectedQuantity,
          amount: subtotal,
          currency: 'BRL'
        }
      });

      if (checkoutError) throw checkoutError;

      // 3. Insert pending transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          ganhavel_id: rifaId,
          amount: subtotal,
          currency: 'BRL',
          payment_provider: selectedProvider,
          payment_id: checkoutData.provider_payment_id,
          status: 'pending',
          fee_fixed: checkoutData.fee_fixed || 0,
          fee_pct: checkoutData.fee_pct || 0,
          fee_amount: checkoutData.fee_amount || 0
        });

      if (transactionError) throw transactionError;

      // 4. Redirect to payment
      window.location.href = checkoutData.redirect_url;

    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Erro ao processar compra');
    } finally {
      setPurchasing(false);
    }
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

  // Map organizer data correctly
  type OrganizerData = {
    name: string;
    username: string;
    bio?: string | null;
    location?: string | null;
    memberSince: string;
    totalGanhaveisLancados: number;
    ganhaveisCompletos: number;
    totalGanhaveisParticipados: number;
    ganhaveisGanhos: number;
    avaliacaoMedia: number;
    totalAvaliacoes: number;
    avatar: string;
    website?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
    };
  };

  function fmtMemberSince(createdAt?: string | null) {
    if (!createdAt) return "Jan 2023";
    const d = new Date(createdAt);
    return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  }

  const organizerData = organizer ? {
    name: organizer.display_name || organizer.full_name || organizer.username || "Organizador",
    username: organizer.username || "",
    bio: organizer.bio || "Organizador verificado na Ganhavel com histórico comprovado de entregas pontuais e rifas bem-sucedidas.",
    location: organizer.location,
    memberSince: fmtMemberSince(organizer.created_at),
    avatar: organizer.avatar_url || "/placeholder.svg",
    totalGanhaveisLancados: 10,
    ganhaveisCompletos: 9,
    totalGanhaveisParticipados: 50,
    ganhaveisGanhos: 3,
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 45,
    socialLinks: {}
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${rifa.title} - Rifa na Ganhavel`}
        description={`${rifa.description} Participe desta rifa por apenas R$ ${rifa.ticket_price.toFixed(2)}. Organizado por ${organizerData?.name || 'Organizador'}.`}
        canonical={`https://ganhavel.com/ganhavel/${rifa.id}`}
        ogImage={rifa.image_url}
        ogType="product"
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
                <span className="text-base font-semibold">{organizerData?.location || 'Brasil'}</span>
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
                  src={rifa.image_url}
                  alt={rifa.title}
                  className="w-full h-[50vh] md:h-96 object-cover"
                />
                {rifa.status !== 'approved' && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 text-white">
                    Em revisão
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                    Meta alcançada!
                  </Badge>
                )}
                {isSoldOut && !isCompleted && (
                  <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                    Esgotado
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
                        url={`${window.location.origin}/#/ganhavel/${rifaId}`}
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
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {rifa.description}
                        </div>
                      </div>
                      
                      {rifa.vendor_link && (
                        <div className="border-t pt-4">
                          <Button asChild variant="outline" className="w-full">
                            <a href={rifa.vendor_link} target="_blank" rel="noopener noreferrer">
                              Comprar diretamente com o vendedor
                            </a>
                          </Button>
                        </div>
                      )}
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

            {/* Organizer Card */}
            {organizerData && (
              <div className="px-4 lg:px-0">
                <DetalhesOrganizador organizer={organizerData} />
              </div>
            )}
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-3 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                    <div>
                      <p className="text-2xl font-bold text-success">R$ {rifa.amount_collected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-muted-foreground">Arrecadados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">R$ {rifa.goal_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-muted-foreground">Meta</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Sorteio: {percentage}% completo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>🎯 Sorteio após arrecadação total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span>🏛️ {rifa.lottery_type || 'Loteria Federal'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{rifa.paid_tickets} bilhetes vendidos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>{rifa.tickets_remaining} bilhetes disponíveis</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Section */}
                {!user ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">Entre para comprar bilhetes</p>
                    <Button onClick={() => navigate('/login')} size="lg" className="w-full">
                      Entrar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Bilhete</span>
                      <span className="text-lg font-bold">R$ {rifa.ticket_price.toFixed(2)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Quantidade</label>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuantityChange(selectedQuantity - 1)}
                          disabled={selectedQuantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={selectedQuantity}
                          onChange={handleInputChange}
                          className="w-20 text-center"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleQuantityChange(selectedQuantity + 1)}
                          disabled={selectedQuantity >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Payment provider is now fixed to Asaas */}

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Subtotal ({selectedQuantity} bilhetes)</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {fee > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Taxa institucional</span>
                          <span>+ R$ {fee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between font-semibold text-lg border-t pt-3">
                        <span>Total a pagar</span>
                        <span>R$ {total.toFixed(2)}</span>
                      </div>
                    </div>

                    {fee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Taxa institucional: R$ {fee.toFixed(2)} destinados à instituição financeira para processamento e segurança dos pagamentos.
                      </p>
                    )}

                    <Button 
                      onClick={handlePurchase}
                      size="lg" 
                      className="w-full"
                      disabled={!canPurchase || purchasing}
                    >
                      {purchasing 
                        ? "Processando..." 
                        : isCompleted 
                          ? "Meta alcançada — aguardando sorteio" 
                          : isSoldOut 
                            ? "Rifa esgotada"
                            : rifa.status !== 'approved'
                              ? "Em revisão"
                              : `Comprar ${selectedQuantity} bilhetes`
                      }
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>{rifa.lottery_type || 'Loteria Federal'} – 100% seguro e transparente</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}