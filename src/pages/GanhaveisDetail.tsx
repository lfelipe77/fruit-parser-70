import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Clock, Users, Trophy, CheckCircle, MapPin, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ShareButton from "@/components/ShareButton";
import DetalhesOrganizador from "@/components/DetalhesOrganizador";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { formatBRL, formatDateBR } from "@/lib/formatters";
import { RafflePublicMoney, PublicProfile } from "@/types/public-views";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function RifaDetail() {
  console.log('[GanhaveisDetail] Component starting to render');
  
  const [selectedCountry, setSelectedCountry] = useState("brasil");
  const [qty, setQty] = useState(3);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [raffle, setRaffle] = useState<RafflePublicMoney | null>(null);
  const [organizer, setOrganizer] = useState<PublicProfile | null>(null);
  const [vendorUrl, setVendorUrl] = useState<string | null>(null);
  
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
        console.log('[GanhaveisDetail] Fetching raffle data for ID:', rifaId);
        
        // main raffle from money view
        const { data: r, error: raffleError } = await (supabase as any)
          .from('raffles_public_money_ext')
          .select('id,title,description,image_url,status,ticket_price,draw_date,category_name,subcategory_name,amount_raised,goal_amount,progress_pct_money,last_paid_at')
          .eq('id', rifaId)
          .maybeSingle();
          
        console.log('[GanhaveisDetail] Raffle query result:', { data: r, error: raffleError });
        
        if (raffleError) {
          throw raffleError;
        }
        
        const raffleData = (r ?? null) as RafflePublicMoney | null;
        
        if (!raffleData) {
          throw new Error('Rifa não encontrada');
        }

        // organizer id (from base raffles)
        const { data: base } = await (supabase as any)
          .from('raffles')
          .select('user_id, vendor_link')
          .eq('id', rifaId)
          .maybeSingle();

        const organizerId = base?.user_id ?? null;
        setVendorUrl(base?.vendor_link ?? null);

        // organizer public profile
        const { data: p } = organizerId
          ? await (supabase as any)
              .from('user_profiles_public')
              .select('id,username,full_name,avatar_url,bio,location,website_url,instagram,twitter,facebook,youtube,tiktok,whatsapp,telegram')
              .eq('id', organizerId)
              .maybeSingle()
          : { data: null };
        const organizerData = (p ?? null) as PublicProfile | null;

        setRaffle(raffleData);
        setOrganizer(organizerData);
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
        event: 'INSERT', 
        schema: 'public', 
        table: 'tickets', 
        filter: `raffle_id=eq.${rifaId}` 
      }, async (payload) => {
        // Check if paid ticket was inserted
        if (payload.new.is_paid) {
          // Refetch single row from money view
          const { data } = await (supabase as any)
            .from('raffles_public_money_ext')
            .select('amount_raised,goal_amount,progress_pct_money,last_paid_at')
            .eq('id', rifaId)
            .maybeSingle();
          
          if (data && raffle) {
            setRaffle(prev => prev ? { ...prev, ...data } : null);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rifaId, raffle]);

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

  if (!raffle) {
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

  // Derived/UX helpers
  const pct = Math.max(0, Math.min(100, raffle?.progress_pct_money ?? 0));
  const drawLabel = raffle?.draw_date ? formatDateBR(raffle.draw_date) : '—';
  const feeFixed = 2.00;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;
  const lastPaidAgo = useRelativeTime(raffle?.last_paid_at, "pt-BR");
  const isActive = raffle?.status === 'active';

  const handlePurchase = async () => {
    if (!rifaId || !user || !isActive) {
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
          p_qty: qty
        });

      if (reserveError) throw reserveError;
      if (!ticketNumbers || ticketNumbers.length === 0) {
        toast.error('Não há bilhetes disponíveis');
        return;
      }

      // 2. Create checkout (Asaas only)
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-checkout', {
        body: {
          provider: 'asaas',
          raffle_id: rifaId,
          qty: qty,
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
          payment_provider: 'asaas',
          payment_id: checkoutData.provider_payment_id,
          status: 'pending',
          fee_fixed: feeFixed,
          fee_amount: feeFixed,
          total_amount_computed: total
        });

      if (transactionError) throw transactionError;

      // 4. Open in new tab
      window.open(checkoutData.url, '_blank');

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

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${raffle.title} - Rifa na Ganhavel`}
        description={`${raffle.description} Participe desta rifa por apenas ${formatBRL(raffle.ticket_price)}. Meta: ${formatBRL(raffle.goal_amount)}.`}
        canonical={`https://ganhavel.com/ganhavel/${raffle.id}`}
        ogImage={raffle.image_url}
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
                <div className="font-medium text-foreground">{drawLabel}</div>
              </div>
              
              {/* Location - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2 border-l pl-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-base font-semibold">{organizer?.location || 'Brasil'}</span>
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
                  src={raffle.image_url || '/placeholder.svg'}
                  alt={raffle.title}
                  className="w-full h-[50vh] md:h-96 object-cover"
                />
                {raffle.status !== 'active' && raffle.status !== 'completed' && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 text-white">
                    Em revisão
                  </Badge>
                )}
                {pct >= 100 && (
                  <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                    Meta alcançada!
                  </Badge>
                )}
              </div>
              
              <div className="px-4 lg:px-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">{raffle.title}</h1>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                  {raffle.description}
                </p>
                
                {/* Share Section - Simplified on mobile */}
                <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg p-4 md:p-6 shadow-sm mb-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 items-center text-center">
                    <div className="w-full md:w-auto">
                      <ShareButton 
                        url={`${window.location.origin}/#/ganhavel/${rifaId}`}
                        title={`Confira esta rifa: ${raffle.title}`}
                        description={raffle.description || ''}
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
              
                <TabsContent value="details" className="space-y-6">
                  <div className="bg-card border rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Descrição
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {raffle.description}
                    </p>
                  </div>

                  {/* Trust Section */}
                  <div className="bg-card border rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Por que confiar?
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <h4 className="font-medium">Seguimos a Loteria Federal</h4>
                          <p className="text-sm text-muted-foreground">Sorteios transparentes baseados na Loteria Federal brasileira</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <h4 className="font-medium">Organizador verificado</h4>
                          <p className="text-sm text-muted-foreground">Perfil verificado com histórico comprovado</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                        <div>
                          <h4 className="font-medium">Prêmio garantido</h4>
                          <p className="text-sm text-muted-foreground">Valores seguros e entrega garantida</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organizer Block */}
                  {organizer && (
                    <div className="bg-card border rounded-2xl p-6">
                      <h3 className="text-lg font-semibold mb-4">Organizador</h3>
                      <DetalhesOrganizador
                        organizer={{
                          name: organizer.full_name || organizer.username || "Organizador",
                          username: organizer.username || "",
                          bio: organizer.bio || "Organizador verificado na Ganhavel.",
                          location: organizer.location,
                          memberSince: "Jan 2023",
                          avatar: organizer.avatar_url || "/placeholder.svg",
                          totalGanhaveisLancados: 10,
                          ganhaveisCompletos: 9,
                          totalGanhaveisParticipados: 50,
                          ganhaveisGanhos: 3,
                          avaliacaoMedia: 4.8,
                          totalAvaliacoes: 45,
                          socialLinks: {
                            instagram: organizer.instagram || undefined,
                            facebook: organizer.facebook || undefined,
                            twitter: organizer.twitter || undefined,
                          }
                        }}
                      />
                      {vendorUrl && (
                        <div className="mt-4 pt-4 border-t">
                          <Button asChild variant="outline" className="w-full">
                            <a href={vendorUrl} target="_blank" rel="noopener noreferrer">
                              Compre direto com o vendedor
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
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
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  {formatBRL(raffle.amount_raised)} de {formatBRL(raffle.goal_amount)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress */}
                <div className="space-y-3">
                  <Progress value={pct} className="h-3" />
                  <div className="text-center text-sm text-muted-foreground">
                    Sorteio: {pct}% completo
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Último pagamento: {lastPaidAgo}
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
                      <span className="text-lg font-semibold">Bilhete — {formatBRL(raffle.ticket_price)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bilhetes ({qty}×)</label>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          disabled={qty <= 1}
                        >
                          −
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={qty}
                          onChange={(e) => setQty(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                          className="w-20 text-center"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setQty(Math.min(100, qty + 1))}
                          disabled={qty >= 100}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatBRL(subtotal)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Taxa institucional</span>
                        <span>{formatBRL(feeFixed)}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold text-lg border-t pt-3">
                        <span>Total</span>
                        <span>{formatBRL(total)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Taxa institucional: {formatBRL(feeFixed)} destinados à instituição financeira para processamento e segurança dos pagamentos.
                    </p>

                    <Button 
                      onClick={handlePurchase}
                      size="lg" 
                      className="w-full"
                      disabled={!isActive || purchasing}
                    >
                      {purchasing 
                        ? "Processando..." 
                        : !isActive 
                          ? "Rifa indisponível"
                          : `Comprar ${qty} bilhetes`
                      }
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      <span>100% seguro e transparente</span>
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