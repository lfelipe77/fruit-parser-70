import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, Star, Users, TrendingUp, Zap, Shield, PlayCircle, MessageCircle, Mail, BarChart3, Globe, Clock, Handshake, Target, Award, DollarSign, Camera, Video, Heart, Share2, Sparkles, Rocket, PieChart, Building2, Package, ShoppingCart, Crown, ExternalLink, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SEOHead from '@/components/SEOHead';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { InView } from 'react-intersection-observer';
import meetingSymbolic from '@/assets/meeting-symbolic.jpg';
import heroImageNew from '@/assets/hero-image-new.jpg';
import AsaasPartnershipSection from '@/components/AsaasPartnershipSection';
import PartnershipModels from '@/components/PartnershipModels';
import NextStepsSection from '@/components/NextStepsSection';
import ImpactSection from '@/components/ImpactSection';
import FounderVisionSection from '@/components/FounderVisionSection';

const passwordSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória'),
});

interface PasswordProtectionProps {
  onAccess: () => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onAccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      passwordSchema.parse({ password });
      
      // Rate limiting
      if (attempts >= 3) {
        setError('Muitas tentativas. Tente novamente em alguns minutos.');
        setIsLoading(false);
        return;
      }

      // Check password
      if (password === 'ganhavel2024' || password === 'kabum2024' || password === 'kabum2025') {
        onAccess();
      } else {
        setAttempts(prev => prev + 1);
        setError('Senha incorreta. Tente novamente.');
        setPassword('');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Proposta Kabum
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Acesso restrito - Digite a senha para continuar
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-12 bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Verificando...' : 'Acessar Proposta'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tentativas restantes: {3 - attempts}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  className = ""
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="text-blue-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

interface AnimatedNumberProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, isVisible]);

  return (
    <InView onChange={(inView) => setIsVisible(inView)} triggerOnce>
      <span className={className}>
        {prefix}{count.toLocaleString()}{suffix}
      </span>
    </InView>
  );
};

const GanhaveisPartnershipKabum = () => {
  const [hasAccess, setHasAccess] = useState(false);

  if (!hasAccess) {
    return <PasswordProtection onAccess={() => setHasAccess(true)} />;
  }

  return (
    <>
      <SEOHead 
        title="Proposta de Parceria - Ganhavel & Kabum"
        description="Proposta estratégica de parceria entre Ganhavel e Kabum para revolucionar o engajamento e vendas no e-commerce."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                  Proposta Estratégica
                </Badge>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Ganhavel + Kabum
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Uma parceria inovadora que pode revolucionar o <span className="font-semibold text-blue-600">engajamento</span>, 
                  <span className="font-semibold text-purple-600"> as vendas</span> e a 
                  <span className="font-semibold text-pink-600"> experiência dos clientes</span> da Kabum.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Aumento de Engajamento</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium">Expansão de Audiência</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">Conteúdo Viral</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl opacity-20 blur-3xl" />
                <img 
                  src={heroImageNew} 
                  alt="Ganhavel Partnership Hero" 
                  className="relative z-10 w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* O que é a Ganhavel */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">O que é a Ganhavel</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Marketplace de ganháveis que conecta criadores de conteúdo, influenciadores e marcas 
                através de experiências gamificadas e engajamento autêntico.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 border-0">
                <CardContent>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Criadores de Conteúdo</h3>
                  <p className="text-muted-foreground">Influenciadores usam a plataforma para criar rifas com produtos incríveis e engajar suas audiências de forma autêntica.</p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 border-0">
                <CardContent>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Experiência Gamificada</h3>
                  <p className="text-muted-foreground">Transformamos a experiência de compra em algo divertido, transparente e emocionante através de sorteios ao vivo.</p>
                </CardContent>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-0">
                <CardContent>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">Transparência Total</h3>
                  <p className="text-muted-foreground">Todos os sorteios são realizados ao vivo, com total transparência e usando a loteria federal como base para os resultados.</p>
                </CardContent>
              </Card>
            </div>

          </div>
        </section>

        {/* Oportunidades para a Kabum */}
        <section className="py-20 px-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">Oportunidades Potenciais para a Kabum</h2>
              <p className="text-xl text-muted-foreground">
                Como essa parceria pode transformar o relacionamento da Kabum com seus clientes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Engajamento Revolucionário</h3>
                      <p className="text-muted-foreground">Nova forma de interação com clientes</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Gamificação da experiência de compra</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Aumento do tempo de permanência na marca</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Criação de eventos especiais e lançamentos</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Expansão de Audiência</h3>
                      <p className="text-muted-foreground">Alcance orgânico exponencial</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Acesso a audiências de diversos influenciadores</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Novos segmentos de mercado</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Marketing boca a boca amplificado</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Conteúdo Viral</h3>
                      <p className="text-muted-foreground">Máxima exposição orgânica</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Lives de sorteio geram milhões de visualizações</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Conteúdo espontâneo e autêntico</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Alcance orgânico sem custos de mídia</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">Dados e Insights</h3>
                      <p className="text-muted-foreground">Inteligência de mercado valiosa</p>
                    </div>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Comportamento de compra detalhado</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>Preferências por categoria de produto</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                      <span>ROI mensurável e transparente</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Modelos de Parceria */}
        <PartnershipModels />

        {/* Próximos Passos */}
        <NextStepsSection />

        {/* Impacto */}
        <ImpactSection />

        {/* Visão do Fundador */}
        <FounderVisionSection />

        {/* CTA Final melhorado */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Separador visual elegante */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
              <div className="px-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
            </div>

            <div className="text-center space-y-8">
              {/* Título principal */}
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Vamos Conversar?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Adoraríamos agendar uma conversa com o time da Kabum para explorar como essa parceria pode revolucionar o engajamento e as vendas.
                </p>
              </div>

              {/* Card de call-to-action */}
              <Card className="p-8 bg-gradient-to-br from-primary/5 via-purple-50/50 to-blue-50/50 dark:from-primary/10 dark:via-purple-900/10 dark:to-blue-900/10 border-primary/20 shadow-lg">
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold text-foreground">
                        Demonstração Personalizada
                      </h3>
                      <p className="text-muted-foreground">
                        Apresentação exclusiva do potencial da parceria, incluindo casos de uso específicos para a Kabum e simulações de campanhas.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          <Clock className="w-3 h-3 mr-1" />
                          30-45 min
                        </Badge>
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300">
                          <Users className="w-3 h-3 mr-1" />
                          Equipe completa
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          Métricas reais
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <img 
                        src={meetingSymbolic} 
                        alt="Reunião simbólica representando parceria entre Ganhavel e Kabum" 
                        className="relative z-10 w-full rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <Separator className="bg-primary/20" />

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 min-w-[200px]"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Agendar Reunião
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="border-primary/30 text-primary hover:bg-primary/5 min-w-[200px]"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Enviar Proposta
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Informações de contato */}
              <div className="bg-muted/30 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-3">
                  <strong>Contato direto:</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
                  <a 
                    href="mailto:felipe@ganhavel.com" 
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    felipe@ganhavel.com
                  </a>
                  <a 
                    href="https://wa.me/5511999999999" 
                    className="flex items-center gap-2 text-green-600 hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp: (11) 99999-9999
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default GanhaveisPartnershipKabum;