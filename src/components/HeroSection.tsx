import { Button } from "@/components/ui/button";
import { Play, TrendingUp, Users, Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useHeroCopy } from "@/hooks/useHeroCopy";
import { FadeText } from "@/components/FadeText";
import { useAuthContext } from "@/providers/AuthProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import heroImage from "/lovable-uploads/a4d4bbdb-5b32-4b05-a45d-083c4d90dbb9.png";

export default function HeroSection() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const isMobile = useIsMobile();
  
  // Auto-rotating text every 2 minutes
  const { headline, subline } = useHeroCopy({ 
    autoRotateMs: 120000, // 2 minutes
    persist: "none" 
  });
  
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
            
            {/* Login/Signup buttons - only show on mobile when not logged in */}
            {isMobile && !user && (
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
                <div className="font-semibold text-base md:text-lg">R$ 8M+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Premiado</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-base md:text-lg">25K+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Participantes</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-8 md:w-10 h-8 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Target className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                  </div>
                </div>
                <div className="font-semibold text-base md:text-lg">890+</div>
                <div className="text-xs md:text-sm text-muted-foreground">Ganhaveis</div>
              </div>
            </div>
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
              <div className="text-2xl font-bold text-primary">128</div>
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