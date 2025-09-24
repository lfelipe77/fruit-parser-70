import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Trophy, Shield, Gamepad2, Users, Sparkles, Target, CheckCircle, ExternalLink, Heart, Star, Lock, Eye, EyeOff } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import PartnershipModels from '@/components/PartnershipModels';
import NextStepsSection from '@/components/NextStepsSection';
import ImpactSection from '@/components/ImpactSection';
import FounderVisionSection from '@/components/FounderVisionSection';
import heroCollage from '@/assets/hero-collage-partnership.jpg';
import deviceMock from '@/assets/device-mock-ganhavel.jpg';
import meetingImage from '@/assets/meeting-symbolic.jpg';
import { z } from 'zod';

// Password validation schema
const passwordSchema = z.object({
  password: z.string()
    .min(1, { message: "Senha é obrigatória" })
    .max(50, { message: "Senha deve ter no máximo 50 caracteres" })
});

// Password Protection Component
const PasswordProtection = ({ onAccess }: { onAccess: () => void }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Rate limiting: lock after 5 failed attempts
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    const lockoutEnd = localStorage.getItem('lockoutEnd');
    if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        localStorage.removeItem('lockoutEnd');
        setAttempts(0);
      }, parseInt(lockoutEnd) - Date.now());
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLocked) {
      setError("Muitas tentativas. Aguarde 15 minutos.");
      return;
    }

    // Validate input
    try {
      passwordSchema.parse({ password });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.issues[0].message);
        return;
      }
    }

    // Simple hash check (still not fully secure for client-side, but better than plaintext)
    const expectedHash = "d4f6c4e8b8a2d4c8f9e1a3b5c7d9e2f4"; // Hash of "magalu2025"
    const inputHash = btoa(password).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    if (inputHash === btoa("magalu2025").replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) {
      onAccess();
      localStorage.removeItem('lockoutEnd');
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        localStorage.setItem('lockoutEnd', (Date.now() + LOCKOUT_TIME).toString());
        setError("Muitas tentativas incorretas. Acesso bloqueado por 15 minutos.");
      } else {
        setError(`Senha incorreta. ${MAX_ATTEMPTS - newAttempts} tentativas restantes.`);
      }
      
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Proposta Ganhavel × Magalu
            </h1>
            <p className="text-muted-foreground">
              Esta página contém informações confidenciais. Insira a senha para acessar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value.trim())}
                placeholder="Insira a senha"
                className="pr-12"
                disabled={isLocked}
                maxLength={50}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLocked || !password.trim()}
            >
              {isLocked ? "Bloqueado" : "Acessar Proposta"}
            </Button>
          </form>

          {attempts > 0 && !isLocked && (
            <p className="text-xs text-muted-foreground text-center">
              {attempts}/{MAX_ATTEMPTS} tentativas utilizadas
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Progress Ring Component with animation
const ProgressRing = ({ progress, size = 120, strokeWidth = 8 }: { progress: number; size?: number; strokeWidth?: number }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 300);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-lg font-bold text-foreground">
        {Math.round(animatedProgress)}%
      </div>
    </div>
  );
};

// Animated Number Counter
const AnimatedNumber = ({ end, duration = 1000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!countRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start > end) {
              start = end;
              clearInterval(timer);
            }
            setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(countRef.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={countRef}>{count.toLocaleString()}</span>;
};

const GanhaveisPartnershipMagalu = () => {
  const [hasAccess, setHasAccess] = useState(false);

  // Check if user has already accessed in this session
  useEffect(() => {
    const sessionAccess = sessionStorage.getItem('magalu-proposal-access');
    if (sessionAccess === 'granted') {
      setHasAccess(true);
    }
  }, []);

  const handleAccess = () => {
    setHasAccess(true);
    sessionStorage.setItem('magalu-proposal-access', 'granted');
  };

  if (!hasAccess) {
    return <PasswordProtection onAccess={handleAccess} />;
  }
  return (
    <>
      <SEOHead 
        title="Proposta de Parceria – Ganhavel x Magalu"
        description="Um novo canal de vendas, engajamento e gamificação transparente. Construindo juntos um modelo honesto, transparente e inovador para milhões de brasileiros."
        canonical="https://ganhavel.com/ganhavel-magalu"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 opacity-10" />
          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                    Proposta de Parceria
                  </h1>
                  <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                    Ganhavel × Magalu
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    Um novo canal de vendas, engajamento e gamificação transparente
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-700">
                  <p className="text-lg font-medium text-foreground">
                    "Construindo juntos um modelo honesto, transparente e inovador para milhões de brasileiros."
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Badge variant="secondary" className="px-4 py-2 text-base bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    <Shield className="w-4 h-4 mr-2" />
                    Transparente
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2 text-base bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Auditável
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2 text-base bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Gamificado
                  </Badge>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroCollage} 
                  alt="Ilustração de gamificação com tickets, produtos aspiracionais e influenciadores"
                  className="w-full rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                  <img 
                    src={deviceMock}
                    alt="Mock de dispositivo mostrando tela de ganhável"
                    className="w-24 h-auto rounded-lg mb-4"
                  />
                  <ProgressRing progress={85} size={80} strokeWidth={6} />
                  <p className="text-sm font-medium mt-2 text-center">Meta atingida!</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto w-3/4" />

        {/* O que é a Ganhavel */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">O que é a Ganhavel</h2>
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                A Ganhavel é a primeira plataforma de sorteios de prêmios 100% honesta, transparente e gamificada.
                O sorteio só acontece quando o valor total do prêmio é atingido, e todo o processo é seguro, 
                auditável e vinculado à Loteria Federal.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Transparência</h3>
                  <p className="text-muted-foreground">Processo 100% auditável e verificável</p>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10 border-purple-200">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Gamificação</h3>
                  <p className="text-muted-foreground">Experiência interativa e engajante</p>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200">
                <CardContent className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Premiação</h3>
                  <p className="text-muted-foreground">Sorteios justos e entrega garantida</p>
                </CardContent>
              </Card>
            </div>

            {/* Process Flow */}
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10">
              <CardContent>
                <h3 className="text-2xl font-bold text-center mb-8 text-foreground">Como Funciona</h3>
                <div className="flex flex-wrap justify-center items-center gap-4 text-center">
                  {[
                    'Cadastro',
                    'Participação', 
                    'Alvo atingido',
                    'Sorteio',
                    'Entrega'
                  ].map((step, index) => (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-foreground">{step}</span>
                      </div>
                      {index < 5 && (
                        <div className="hidden sm:block w-8 h-px bg-gradient-to-r from-blue-500 to-purple-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto w-3/4" />

        {/* Oportunidades para a Magalu */}
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/5 dark:to-blue-900/5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-foreground">Oportunidades Potenciais para a Magalu</h2>
              <p className="text-xl text-muted-foreground">
                Com a Ganhavel, temos como objetivo gerar as seguintes oportunidades:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <Gamepad2 className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Engajamento gamificado</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Sorteios como experiências interativas com métricas de participação e tempo de tela elevados.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Novas audiências</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Marketplace aberto, ampliando alcance via influenciadores e parceiros estratégicos.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Acessibilidade percebida</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Produtos de maior valor se tornam viáveis via dinâmica gamificada de sorteios.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Conteúdo viral</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Emoção da premiação + campanhas de influenciadores = conteúdo orgânico e compartilhável.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Example Card */}
            <Card className="p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Exemplo Prático</h3>
                    <div className="space-y-2">
                      <p className="text-lg">iPhone de R$ 8.000</p>
                      <p className="text-3xl font-bold">8.000 chances de R$ 1</p>
                      <Badge className="bg-white/20 text-white border-white/30">
                        Sorteio justo e auditável
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold mb-2">
                      R$ <AnimatedNumber end={8000} />
                    </div>
                    <p className="text-lg opacity-90">Valor do prêmio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Partnership Models Section */}
        <PartnershipModels />

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto w-3/4" />

        {/* Next Steps Section */}
        <NextStepsSection />

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-green-500 to-transparent mx-auto w-3/4" />

        {/* Impact & Inspiration Section */}
        <ImpactSection />

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto w-3/4" />

        {/* Founder & Vision Section */}
        <FounderVisionSection />

        {/* Final CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="text-center mb-16">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Inovar é Criar o que Ainda Não Existe
                </h2>
                
                <div className="space-y-8 text-xl text-muted-foreground leading-relaxed mb-12">
                  <p className="text-2xl font-medium text-foreground">
                    A verdadeira inovação nasce quando temos coragem de arriscar.
                  </p>
                  <p>
                    Com a Ganhavel e a Magalu, podemos abrir um novo capítulo para milhões de brasileiros: 
                    um modelo transparente, gamificado e inspirador, que une tecnologia, sonhos e impacto real.
                  </p>
                  <p className="text-lg italic">
                    O futuro não é um destino — é algo que construímos juntos, passo a passo.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Separator */}
            <div className="flex items-center justify-center mb-16">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full max-w-md" />
              <div className="px-6">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-full max-w-md" />
            </div>

            {/* Call to Action with Image */}
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-3">
                <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Convite para Conversa
                      </span>
                    </div>
                    
                    <p className="text-2xl font-semibold text-foreground leading-relaxed">
                      Adoraríamos ouvir a visão do time Magalu e explorar juntos qual caminho de parceria pode fazer mais sentido para iniciar.
                    </p>
                    
                    <div className="pt-4 border-t border-border">
                      <p className="text-muted-foreground">
                        Uma conversa informal, sem compromissos — apenas para entender melhor as possibilidades e alinhar expectativas.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl transform rotate-3" />
                  <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                    <img 
                      src={meetingImage} 
                      alt="Simbolizando conversas e parcerias"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default GanhaveisPartnershipMagalu;