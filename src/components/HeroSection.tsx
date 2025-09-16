import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHeroCopy } from "@/hooks/useHeroCopy";
import { FadeText } from "@/components/FadeText";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { usePublicWinners } from "@/hooks/usePublicWinners";
import heroImage from "/lovable-uploads/a4d4bbdb-5b32-4b05-a45d-083c4d90dbb9.png";

type HomeStats = {
  total_raised: number;
  total_prize_paid: number;
  total_participants: number;
  total_ganhaveis: number;
  active_ganhaveis: number;
  almost_complete_ganhaveis: number;
  total_tickets_sold: number;
  recent_transactions: number;
};

export default function HeroSection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [statsSource, setStatsSource] = useState<'cache' | 'live' | null>(null);
  const { data: winners } = usePublicWinners(1000); // Get all winners for count
  const isDebugMode = new URLSearchParams(window.location.search).has('debug');
  
  // Auto-rotating text every 2 minutes
  const { headline, subline } = useHeroCopy({ 
    autoRotateMs: 120000, // 2 minutes
    persist: "none" 
  });

  async function fetchStats(): Promise<{ src: 'cache'|'live', data: HomeStats|null }> {
    // Skip cache temporarily due to stale data after nuclear reset
    // const cache = await supabase
    //   .from('homepage_stats_cache' as any)   // use `as any` to avoid TS type generation issues for views
    //   .select('*')
    //   .limit(1)
    //   .single();
    // if (!cache.error && cache.data) return { src: 'cache', data: cache.data as unknown as HomeStats };

    const live = await supabase
      .from('homepage_stats' as any)
      .select('*')
      .limit(1)
      .single();
    if (!live.error && live.data) return { src: 'live', data: live.data as unknown as HomeStats };

    return { src: 'live', data: null };
  }

  useEffect(() => {
    fetchStats().then(({ data, src }) => {
      if (data) {
        setStats(data);
        setStatsSource(src);
        if (isDebugMode) {
          console.info('[homepage_stats]', { src, data });
        }
      }
    }).catch(console.error);
  }, [isDebugMode]);

  // Formatters
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${Math.floor(num / 1000)}K+`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `R$ ${Math.floor(num / 1000)}K+`;
    return `R$ ${num}`;
  };

  // Use real stats or fallback to hardcoded values
  const paid = Number(stats?.total_prize_paid ?? 0);
  
  // For the floating card, show active ganhaveis (not total)
  const activeCount = stats?.active_ganhaveis ?? 128;
  
  // Count actual winners from the v_public_winners view (like in Resultados/Premiados)
  const winnersCount = winners?.length ?? 0;
  const hasWinners = winnersCount > 0;
  
  const displayStats = {
    prizeValue: hasWinners ? winnersCount.toString() : "0",
    prizeLabel: "Premiados",
    participants: stats ? stats.total_participants.toString() : "25000",
    ganhaveis: stats ? stats.active_ganhaveis.toString() : "890",
    activeGanhaveis: activeCount.toString()
  };
  
  return (
    <section className="relative bg-gradient-hero py-12 md:py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 md:space-y-8 animate-fade-in text-center lg:text-left">
            <div className="space-y-4 max-w-xl mx-auto lg:mx-0">
              <FadeText 
                as="h1" 
                duration={600}
                className="text-3xl md:text-4xl lg:text-6xl font-bold leading-tight"
              >
                {String(headline ?? '')}
              </FadeText>
              <FadeText 
                as="p" 
                duration={600}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed"
              >
                {String(subline ?? '')}
              </FadeText>
            </div>
            
            {/* Mobile image - shown right after title on mobile only */}
            <div className="lg:hidden relative max-w-sm mx-auto animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="Ganhavel – amigos comemorando prêmios reais: carros, viagens e tecnologia"
                  className="w-full h-[250px] md:h-[300px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="text-base md:text-lg px-6 md:px-8" asChild>
                <Link to="/lance-seu-ganhavel">
                  {t('launchGanhavel')}
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8" asChild>
                <Link to="/como-funciona">
                  <Play className="w-5 h-5 mr-2" />
                  {t('howItWorks')}
                </Link>
              </Button>
            </div>
            
            {/* Login/Signup buttons - only show when not logged in */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-4">
                <Button variant="outline" size="default" className="text-sm px-6" asChild>
                  <Link to="/login">
                    Entrar
                  </Link>
                </Button>
                <Button variant="secondary" size="default" className="text-sm px-6" asChild>
                  <Link to="/cadastro">
                    Criar Conta
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-4 md:gap-6 pt-6 md:pt-8 max-w-lg mx-auto lg:mx-0">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                  </div>
                </div>
                <div className={`font-semibold text-base md:text-lg ${!hasWinners ? 'text-muted-foreground' : ''}`}>
                  {displayStats.prizeValue}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground">{displayStats.prizeLabel}</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-base md:text-lg">{displayStats.participants}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Participantes</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-base md:text-lg">{displayStats.ganhaveis}</div>
                <div className="text-xs md:text-sm text-muted-foreground">Ganhaveis Ativos</div>
              </div>
            </div>
            
            {/* Debug info - only shown with ?debug=1 */}
            {isDebugMode && stats && (
              <div className="text-xs text-muted-foreground mt-2 text-center lg:text-left">
                stats: source={statsSource}, active={stats.active_ganhaveis}, almost_complete={stats.almost_complete_ganhaveis}, recent_tx_7d={stats.recent_transactions}, total_prize_paid={stats.total_prize_paid}
              </div>
            )}
          </div>
          
          {/* Desktop image - hidden on mobile */}
          <div className="hidden lg:block relative lg:ml-8 animate-scale-in max-w-lg mx-auto lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Ganhavel – amigos comemorando prêmios reais: carros, viagens e tecnologia"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Floating stats cards - only on desktop */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg animate-pulse">
              <div className="text-sm text-muted-foreground">Ganhaveis Ativos</div>
              <div className="text-2xl font-bold text-primary">{displayStats.activeGanhaveis}</div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg animate-pulse delay-150">
              <div className="text-sm text-muted-foreground">Taxa de Entrega</div>
              <div className="text-2xl font-bold text-success">100%</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}