import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { timeAgo, formatCurrency } from "@/types/raffles";
import LotteryFederalTab from "@/components/LotteryFederalTab";
import LotteryFederalCard from "@/components/LotteryFederalCard";
import WinnersList from "@/components/WinnersList";
import PremiadosList from "@/components/PremiadosList";
import { nextFederalDrawDate, dateBR } from "@/utils/nextFederalDraw";
import { useCompletedUnpickedRaffles } from "@/hooks/useCompletedUnpickedRaffles";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

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
  // Latest federal store data with refetch options
  const { data: latestFederal } = useQuery({
    queryKey: ['lottery_latest_federal_store'],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("lottery_latest_federal_store")
        .select("concurso_number, draw_date")
        .eq("game_slug", "federal")
        .maybeSingle();
      return data;
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  // Complete raffles data - using new hook that excludes raffles with winners
  const { data: completeRaffles, isLoading: completeLoading } = useCompletedUnpickedRaffles();

  // Almost complete raffles data
  const { data: almostCompleteRaffles, isLoading: almostLoading } = useQuery({
    queryKey: ['almost_complete_raffles'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,image_url,goal_amount,amount_raised,progress_pct_money,participants_count,draw_date,ticket_price')
        .eq('status', 'active')
        .gte('progress_pct_money', 80)
        .lt('progress_pct_money', 100)
        .order('progress_pct_money', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000,
  });

  const latestConcurso = latestFederal?.concurso_number ?? null;
  const latestDate = latestFederal?.draw_date ?? null;
  const loading = completeLoading || almostLoading;


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
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <LotteryFederalCard />
      </section>

      {/* Tabbed Results */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Tabs defaultValue="quase" className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1 sm:gap-0 bg-muted p-1">
              <TabsTrigger value="quase" className="text-sm px-3 py-3 sm:py-2 whitespace-nowrap">
                🔄 Quase Completas
              </TabsTrigger>
              <TabsTrigger value="completas" className="text-sm px-3 py-3 sm:py-2 whitespace-nowrap">
                ✅ Completas
              </TabsTrigger>
              <TabsTrigger value="premiados" className="text-sm px-3 py-3 sm:py-2 whitespace-nowrap">
                🏆 Premiados
              </TabsTrigger>
            </TabsList>

            {/* Quase Completas - First Tab */}
            <TabsContent value="quase" className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                    Ganhaveis Quase Completos
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Ganhaveis com mais de 80% dos números vendidos
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {almostCompleteRaffles.length === 0 ? (
                  <Card className="p-8 text-center lg:col-span-2 xl:col-span-3">
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
                    <Card key={draw.id} className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="truncate text-base font-semibold">{String(draw.title ?? '')}</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-600 self-start sm:self-center">
                            {Number(percentage ?? 0)}%
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {draw.draw_date && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Data Limite:</span>
                            <span className="font-medium">
                              {dayjs(draw.draw_date, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                            </span>
                          </div>
                        )}
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{formatCurrency(raised)}</span>
                            <span className="text-muted-foreground">de {formatCurrency(goal)}</span>
                          </div>
                          <div className="w-full bg-orange-200 dark:bg-orange-900/30 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{percentage}% arrecadado</span>
                            <span>{draw.participants_count || 0} participantes</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Faltam:</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(missing)}</span>
                        </div>
                        
                        <Link to={`/ganhavel/${draw.id}`} className="block">
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            Últimas Chances!
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Rifas Completas - Second Tab */}
            <TabsContent value="completas" className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">
                    Ganhaveis Completos
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    100% dos números vendidos - aguardando próximo sorteio
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {completeRaffles.length === 0 ? (
                  <Card className="p-8 text-center lg:col-span-2 xl:col-span-3">
                    <div className="text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum ganhavel completo aguardando sorteio.</p>
                    </div>
                  </Card>
                 ) : completeRaffles.map((draw) => {
                   // Dev-only safety logs
                   if (import.meta.env.DEV) {
                     console.debug('[Resultados/Completas] nextDraw=', nextFederalDrawDate().toISOString());
                   }
                   
                   return (
                   <Card key={draw.id} className="border-green-200 bg-green-50/50 dark:bg-green-950/20 h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="truncate text-base font-semibold">{String(draw.title ?? '')}</span>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 self-start sm:self-center">
                          100% Completa
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                     <CardContent className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-muted-foreground">Próximo Sorteio:</span>
                         <span className="font-medium">
                           {dateBR(nextFederalDrawDate())}
                         </span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                         <span className="text-muted-foreground">Horário:</span>
                         <span className="font-medium">20:00</span>
                       </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Valor Total:</span>
                        <span className="font-bold text-lg text-primary">
                          {formatCurrency(Number(draw.goal_amount ?? 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Participantes:</span>
                        <span className="font-semibold">{Number(draw.participants_count ?? 0)}</span>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-900/30 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-full" />
                      </div>
                      <div className="text-center text-sm text-green-700 dark:text-green-400 font-medium">
                        Meta atingida - aguardando sorteio!
                      </div>
                      <Link to={`/ganhavel/${draw.id}`} className="block">
                        <Button variant="outline" className="w-full text-sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                     </CardContent>
                   </Card>
                   );
                 })}
              </div>
            </TabsContent>

            {/* Ganháveis Premiados - Third Tab */}
            <TabsContent value="premiados" className="space-y-4 sm:space-y-6 mt-6 sm:mt-8">
              <section className="mt-4 sm:mt-6">
                <h3 className="text-lg sm:text-xl font-semibold">Ganhadores Públicos</h3>
                <p className="text-sm opacity-70">Sorteios já realizados com ganhadores confirmados</p>
                <div className="mt-4">
                  <PremiadosList />
                </div>
              </section>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      {/* Transparency Info */}
      <section className="py-8 sm:py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
              Transparência Total
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Todos os nossos sorteios seguem os números oficiais da Loteria Federal do País de Origem do Produto, 
              garantindo total transparência e confiabilidade no processo.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                asChild 
                variant="hero" 
                size="lg" 
                className="w-full sm:w-auto"
              >
                <a 
                  href="https://loterias.caixa.gov.br/Paginas/default.aspx" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Ver no Site da Caixa
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link to="/como-funciona">Como Funciona</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}