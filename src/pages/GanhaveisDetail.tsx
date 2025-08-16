import React from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Shield, Clock, Users, Trophy, CheckCircle, MapPin, Mail } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import ShareButton from "@/components/ShareButton";
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

export default function GanhaveisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // ✅ All hooks declared first, unconditionally
  const [selectedCountry, setSelectedCountry] = React.useState("brasil");
  const [qty, setQty] = React.useState(3);
  const [loading, setLoading] = React.useState(true);
  const [purchasing, setPurchasing] = React.useState(false);
  const [raffle, setRaffle] = React.useState<RafflePublicMoney | null>(null);
  const [organizer, setOrganizer] = React.useState<PublicProfile | null>(null);
  const [vendorUrl, setVendorUrl] = React.useState<string | null>(null);
  
  // ✅ Call custom hooks unconditionally (pass null/undefined safely)
  const lastPaidAgo = useRelativeTime(raffle?.last_paid_at ?? null, "pt-BR");

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
      name: "Reino Unido", 
      lottery: "UK National Lottery",
      nextDraw: "—"
    }
  };

  // ✅ Data loading inside effects
  React.useEffect(() => {
    if (!id) return;
    
    let alive = true;
    
    const fetchRaffle = async () => {
      try {
        setLoading(true);
        console.log('[GanhaveisDetail] Fetching raffle data for ID:', id);
        
        // main raffle from money view
        const { data: r, error: raffleError } = await (supabase as any)
          .from('raffles_public_money_ext')
          .select('id,title,description,image_url,status,ticket_price,draw_date,category_name,subcategory_name,amount_raised,goal_amount,progress_pct_money,last_paid_at')
          .eq('id', id)
          .maybeSingle();
          
        console.log('[GanhaveisDetail] Raffle query result:', { data: r, error: raffleError });
        
        if (raffleError) {
          throw raffleError;
        }
        
        if (!alive) return;
        const raffleData = (r ?? null) as RafflePublicMoney | null;

        // organizer id (from base raffles)
        const { data: base } = await (supabase as any)
          .from('raffles')
          .select('user_id, vendor_link')
          .eq('id', id)
          .maybeSingle();

        const organizerId = base?.user_id ?? null;
        if (!alive) return;
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

        if (!alive) return;
        setRaffle(raffleData);
        setOrganizer(organizerData);
      } catch (error) {
        console.error('Error fetching raffle:', error);
        if (alive) {
          toast.error('Erro ao carregar rifa');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchRaffle();
    
    return () => {
      alive = false;
    };
  }, [id]);

  // Realtime subscription for ticket updates
  React.useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`raffle-tickets-${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'tickets', 
        filter: `raffle_id=eq.${id}` 
      }, async (payload) => {
        // Check if paid ticket was inserted
        if (payload.new.is_paid) {
          // Refetch single row from money view
          const { data } = await (supabase as any)
            .from('raffles_public_money_ext')
            .select('amount_raised,goal_amount,progress_pct_money,last_paid_at')
            .eq('id', id)
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
  }, [id, raffle]);

  // ✅ Derive values from state (pure)
  const pct = Math.max(0, Math.min(100, raffle?.progress_pct_money ?? 0));
  const amountBRL = formatBRL(raffle?.amount_raised ?? 0);
  const goalBRL = formatBRL(raffle?.goal_amount ?? 0);
  const drawLabel = raffle?.draw_date ? formatDateBR(raffle.draw_date) : "—";
  const isActive = raffle?.status === "active";
  const feeFixed = 2.0;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Faça login para comprar bilhetes');
      navigate('/login');
      return;
    }

    if (!raffle) return;

    setPurchasing(true);
    try {
      // Mock purchase for now - integrate with actual payment system
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Compra realizada com sucesso!');
      navigate('/pagamento-sucesso');
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Erro ao processar compra');
    } finally {
      setPurchasing(false);
    }
  };

  // ✅ Conditional render happens *after* hooks
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900">Ganhavel não encontrado</h1>
            <p className="mt-2 text-gray-600">O ganhavel que você está procurando não existe ou foi removido.</p>
            <Button asChild className="mt-4">
              <Link to="/descobrir">Ver outros ganhaveis</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${raffle.title} - Ganhavel`}
        description={raffle.description || `Participe do sorteio ${raffle.title} na Ganhavel`}
        canonical={`https://ganhavel.com/ganhavel/${raffle.id}`}
        ogImage={raffle.image_url || undefined}
      />
      
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <ShareButton 
              url={window.location.href}
              title={raffle.title}
              description={raffle.description || ''}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Image and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={raffle.image_url || '/placeholder.svg'} 
                    alt={raffle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{raffle.title}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      {raffle.category_name && (
                        <Badge variant="secondary">{raffle.category_name}</Badge>
                      )}
                      <Badge variant={isActive ? "default" : "secondary"}>
                        {isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {raffle.description && (
                  <p className="text-gray-600 mb-4">{raffle.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="rules">Regulamento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      Informações do Sorteio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valor do Bilhete</label>
                        <p className="text-lg font-semibold">{formatBRL(raffle.ticket_price)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Data do Sorteio</label>
                        <p className="text-lg font-semibold">{drawLabel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {organizer && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Organizador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {organizer.avatar_url ? (
                            <img src={organizer.avatar_url} alt={organizer.full_name || organizer.username || ''} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <span className="text-lg font-semibold text-gray-600">
                              {(organizer.full_name || organizer.username || '?').charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{organizer.full_name || organizer.username}</h4>
                          {organizer.bio && <p className="text-sm text-gray-600">{organizer.bio}</p>}
                          {organizer.location && <p className="text-xs text-gray-500">{organizer.location}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="rules">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Regulamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p>Este sorteio é regido pelas seguintes regras:</p>
                      <ul>
                        <li>O sorteio será realizado através da Loteria Federal</li>
                        <li>Cada bilhete dá direito a participar do sorteio</li>
                        <li>O ganhador será contatado através dos dados fornecidos</li>
                        <li>O prêmio deverá ser retirado em até 30 dias</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  {amountBRL} <span className="text-gray-400">de</span> {goalBRL}
                </div>
                <Progress value={pct} className="h-3" />
                <div className="text-sm text-gray-600">
                  Sorteio: {pct}% completo
                </div>
                <div className="text-sm text-gray-600">
                  Último pagamento: {lastPaidAgo}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comprar Bilhetes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Bilhete</div>
                  <div className="text-lg font-semibold">
                    {formatBRL(raffle.ticket_price)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{qty}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQty(q => q + 1)}
                  >
                    +
                  </Button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bilhetes ({qty}x):</span>
                    <span>{formatBRL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxa institucional:</span>
                    <span>{formatBRL(feeFixed)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total a pagar</span>
                    <span>{formatBRL(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!isActive || purchasing}
                  onClick={handlePurchase}
                >
                  {purchasing ? 'Processando...' : `Comprar ${qty} bilhetes`}
                </Button>

                <p className="text-xs text-gray-500">
                  Taxa institucional: R$ 2,00 destinados à instituição financeira
                  para processamento e segurança dos pagamentos.
                </p>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Pagamento 100% seguro</span>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}