import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo, formatCurrency } from "@/types/raffles";
import LotteryFederalTab from "@/components/LotteryFederalTab";
import LotteryFederalCard from "@/components/LotteryFederalCard";
import WinnersList from "@/components/WinnersList";

interface LotteryResult {
  id: string;
  ganhavel_id: string;
  winning_ticket_id: string | null;
  lottery_draw_numbers: string | null;
  result_date: string;
  verified: boolean;
  raffle_title: string;
  raffle_goal_amount: number;
  raffle_image_url: string | null;
  winner_name: string | null;
}

interface FederalDraw {
  id: number;
  concurso_number: string;
  draw_date: string;
  first_prize: string | null;
  prizes: any[];
  source_url: string | null;
  created_at: string;
}

interface CompleteRaffle {
  id: string;
  title: string;
  image_url: string | null;
  goal_amount: number;
  amount_raised: number;
  progress_pct_money: number;
  participants_count: number;
  draw_date: string | null;
}

interface AlmostCompleteRaffle extends CompleteRaffle {
  ticket_price: number;
}


export default function Resultados() {
  const [recentResults, setRecentResults] = useState<LotteryResult[]>([]);
  const [completeRaffles, setCompleteRaffles] = useState<CompleteRaffle[]>([]);
  const [almostCompleteRaffles, setAlmostCompleteRaffles] = useState<AlmostCompleteRaffle[]>([]);
  const [federalDraws, setFederalDraws] = useState<FederalDraw[]>([]);
  const [latestConcurso, setLatestConcurso] = useState<string | null>(null);
  const [latestDate, setLatestDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultsData();
    
    // Fetch latest concurso for winner filtering
    (async () => {
      const { data } = await (supabase as any)
        .from("lottery_latest_federal")
        .select("concurso_number, draw_date")
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      setLatestConcurso(data?.concurso_number ?? null);
      setLatestDate(data?.draw_date ?? null);
    })();
    
    // Real-time updates
    const onUpdated = () => fetchResultsData();
    window.addEventListener("raffleUpdated", onUpdated as any);
    const interval = setInterval(fetchResultsData, 30000);
    
    return () => {
      window.removeEventListener("raffleUpdated", onUpdated as any);
      clearInterval(interval);
    };
  }, []);

  const fetchResultsData = async () => {
    try {
      // Fetch completed raffles with lottery results
      const { data: results, error: resultsError } = await (supabase as any)
        .from('lottery_results')
        .select(`
          id,
          ganhavel_id,
          winning_ticket_id,
          lottery_draw_numbers,
          result_date,
          verified,
          raffles_public_money_ext!inner(
            title,
            goal_amount,
            image_url
          ),
          user_profiles(full_name)
        `)
        .eq('verified', true)
        .order('result_date', { ascending: false })
        .limit(10);

      if (resultsError) {
        console.error('Error fetching results:', resultsError);
      } else {
        const formattedResults: LotteryResult[] = (results || []).map((r: any) => ({
          id: r.id,
          ganhavel_id: r.ganhavel_id,
          winning_ticket_id: r.winning_ticket_id,
          lottery_draw_numbers: r.lottery_draw_numbers,
          result_date: r.result_date,
          verified: r.verified,
          raffle_title: r.raffles_public_money_ext?.title || 'Título não encontrado',
          raffle_goal_amount: r.raffles_public_money_ext?.goal_amount || 0,
          raffle_image_url: r.raffles_public_money_ext?.image_url,
          winner_name: r.user_profiles?.full_name ? 
            `${r.user_profiles.full_name.split(' ')[0]} ${r.user_profiles.full_name.split(' ')[1]?.[0]}. ****` :
            'Ganhador ****'
        }));
        setRecentResults(formattedResults);
      }

      // Fetch complete raffles (100% funded, awaiting draw)
      const { data: completeData, error: completeError } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,image_url,goal_amount,amount_raised,progress_pct_money,participants_count,draw_date')
        .eq('status', 'active')
        .eq('progress_pct_money', 100)
        .order('draw_date', { ascending: true })
        .limit(10);

      if (completeError) {
        console.error('Error fetching complete raffles:', completeError);
      } else {
        setCompleteRaffles(completeData || []);
      }

      // Fetch almost complete raffles (80%+ funded)
      const { data: almostData, error: almostError } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,image_url,goal_amount,amount_raised,progress_pct_money,participants_count,draw_date,ticket_price')
        .eq('status', 'active')
        .gte('progress_pct_money', 80)
        .lt('progress_pct_money', 100)
        .order('progress_pct_money', { ascending: false })
        .limit(10);

      if (almostError) {
        console.error('Error fetching almost complete raffles:', almostError);
      } else {
        setAlmostCompleteRaffles(almostData || []);
      }

      // Fetch federal draws from CAIXA
      const { data: federalData, error: federalError } = await (supabase as any)
        .from('federal_draws')
        .select('id,concurso_number,draw_date,first_prize,prizes,source_url,created_at')
        .order('draw_date', { ascending: false })
        .limit(10);

      if (federalError) {
        console.error('Error fetching federal draws:', federalError);
      } else {
        setFederalDraws(federalData || []);
      }

    } catch (error) {
      console.error('Error fetching results data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando resultados...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-12 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Trophy className="w-4 h-4 mr-2" />
              Resultados Oficiais
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Resultados Ganhavel
            </h1>
            <p className="text-xl text-muted-foreground">
              Confira os ganhadores e resultados oficiais baseados na Loteria Federal
            </p>
            
            {/* Verification banner */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">🏛️ Resultados registrados e verificados com base na Loteria Federal Brasileira</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Federal Results Card */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <LotteryFederalCard />
      </section>

      {/* Tabbed Results */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="quase" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quase">Quase Completas</TabsTrigger>
              <TabsTrigger value="completas">Ganhaveis Completas</TabsTrigger>
              <TabsTrigger value="premiados">Ganháveis Premiados</TabsTrigger>
            </TabsList>

            {/* Quase Completas - First Tab */}
            <TabsContent value="quase" className="space-y-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    Ganhaveis Quase Completos
                  </h2>
                  <p className="text-muted-foreground">
                    Ganhaveis com mais de 80% dos números vendidos
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {almostCompleteRaffles.length === 0 ? (
                  <Card className="p-8 text-center md:col-span-2">
                    <div className="text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum ganhavel próximo de completar.</p>
                    </div>
                  </Card>
                ) : almostCompleteRaffles.map((draw) => {
                  const percentage = draw.progress_pct_money || 0;
                  const raised = draw.amount_raised || 0;
                  const goal = draw.goal_amount || 0;
                  const missing = goal - raised;
                  
                  return (
                    <Card key={draw.id} className="border-orange-200 bg-orange-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="truncate">{String(draw.title ?? '')}</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-600 flex-shrink-0">
                            {Number(percentage ?? 0)}% Completa
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {draw.draw_date && (
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Data Limite:</span>
                              <span className="font-semibold">
                                {new Date(draw.draw_date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          )}
                          
                          {/* Money Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{formatCurrency(raised)}</span>
                              <span className="text-muted-foreground">de {formatCurrency(goal)}</span>
                            </div>
                            <div className="w-full bg-orange-200 rounded-full h-3">
                              <div 
                                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{percentage}% arrecadado</span>
                              <span>{draw.participants_count || 0} participantes</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Faltam:</span>
                            <span className="font-semibold text-orange-600">{formatCurrency(missing)}</span>
                          </div>
                          
                          <Link to={`/ganhavel/${draw.id}`}>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600">
                              <Clock className="w-4 h-4 mr-2" />
                              Últimas Chances!
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Rifas Completas - Second Tab */}
            <TabsContent value="completas" className="space-y-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    Ganhaveis Completos
                  </h2>
                  <p className="text-muted-foreground">
                    100% dos números vendidos - aguardando próximo sorteio
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {completeRaffles.length === 0 ? (
                  <Card className="p-8 text-center md:col-span-2">
                    <div className="text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum ganhavel completo aguardando sorteio.</p>
                    </div>
                  </Card>
                ) : completeRaffles.map((draw) => (
                  <Card key={draw.id} className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                          <span className="truncate">{String(draw.title ?? '')}</span>
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0">
                          100% Completa
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {draw.draw_date && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Próximo Sorteio:</span>
                            <span className="font-semibold">
                              {new Date(draw.draw_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Valor Total:</span>
                          <span className="font-bold text-lg text-primary">
                            {formatCurrency(Number(draw.goal_amount ?? 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Participantes:</span>
                          <span className="font-semibold">{Number(draw.participants_count ?? 0)}</span>
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-3">
                          <div className="bg-green-500 h-3 rounded-full w-full" />
                        </div>
                        <div className="text-center text-sm text-green-700 font-medium">
                          Meta atingida - aguardando sorteio!
                        </div>
                        <Link to={`/ganhavel/${draw.id}`}>
                          <Button variant="outline" className="w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Ganháveis Premiados - Third Tab */}
            <TabsContent value="premiados" className="space-y-6 mt-8">
              <section className="mt-6">
                <h3 className="text-xl font-semibold">Ganhadores</h3>
                <p className="text-sm opacity-70">Sorteios já realizados com ganhadores confirmados</p>
                <div className="mt-4">
                  <WinnersList latestConcurso={latestConcurso} latestDate={latestDate} />
                </div>
              </section>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      {/* Transparency Info */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Transparência Total
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Todos os nossos sorteios seguem os números oficiais da Loteria Federal do País de Origem do Produto, 
              garantindo total transparência e confiabilidade no processo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                Ver no Site da Caixa
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/como-funciona">Como Funciona</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}