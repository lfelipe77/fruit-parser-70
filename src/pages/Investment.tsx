import React from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Shield, 
  Calendar,
  Handshake,
  PieChart,
  AlertTriangle,
  Settings,
  CheckCircle,
  Rocket,
  Target,
  Zap,
  Award,
  Building,
  LineChart
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SITE_VERSION = "2025-08-09-2";
const PROPOSTA_PATH = "/proposta-de-investimento";
const versionedPath = `${PROPOSTA_PATH}?v=${SITE_VERSION}`;
const ogImage = `/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png?v=${SITE_VERSION}`;

const Investment: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SEOHead 
        title="Oportunidade de Investimento — Ganhavel + Monew (Partners)"
        description="Invista na próxima revolução dos sorteios digitais no Brasil. MVP pronto, modelo validado e segurança via Loteria Federal."
        canonical={versionedPath}
        ogImage={ogImage}
      />
      
      <Helmet>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Helmet>

      {/* Header with Logo */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-3 hover-scale group"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                <img 
                  src={`/lovable-uploads/90a8d604-6da6-4291-867b-8c11ee03620e.png?v=${SITE_VERSION}`} 
                  alt="Ganhavel Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Ganhavel
                </h2>
                <p className="text-xs text-muted-foreground">Sorteios Reais</p>
              </div>
            </Link>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Proposta de Investimento
            </Badge>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto px-4 py-16 max-w-4xl relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              Oportunidade de Investimento
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ganhavel + Monew (Partners)
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Invista na próxima revolução dos sorteios digitais no Brasil
            </p>
            <div className="flex justify-center gap-4 mt-8">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Link to={versionedPath}>
                  <Target className="w-5 h-5 mr-2" />
                  Ver Proposta
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="hover-scale">
                <Link to={versionedPath}>
                  <LineChart className="w-5 h-5 mr-2" />
                  Analisar Dados
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Visão Geral */}
        <Card className="mb-12 border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400 text-2xl">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
              Visão Geral
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">MVP Pronto</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              Ganhavel é uma plataforma onde qualquer pessoa pode lançar, participar e promover sorteios de prêmios reais ("ganhaveis").
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-sm">Produtos diversos: físicos, digitais, afiliados, próprios, alheios e virais</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-sm">Produtos afiliados próprios, links próprios, infinitas fontes de renda e marketing viral</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-sm">Segurança total com validação via Loteria Federal</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-sm">Modelo simples: Publica → Vende → Sorteia → Entrega</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-sm">Pagamento seguro: liberado somente com confirmação de entrega</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análise de Mercado */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              Análise de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-foreground/90">
              O mercado de jogos de azar no Brasil é explosivo, com uma demanda reprimida por opções legais e seguras. Ganhavel posiciona-se para capturar usuários de rifas ilegais e jogos como o "Tigrinho", oferecendo uma plataforma regulada, transparente e com viralidade orgânica.
            </p>
            <div className="overflow-hidden rounded-xl border">
              <div className="grid grid-cols-3 bg-muted/40 text-muted-foreground text-sm font-medium">
                <div className="px-4 py-3">Modalidade</div>
                <div className="px-4 py-3">Legalidade</div>
                <div className="px-4 py-3">Faturamento 2025 (Estimado)</div>
              </div>
              <div className="divide-y">
                <div className="grid grid-cols-3">
                  <div className="px-4 py-3">Rifas (pessoa física/online)</div>
                  <div className="px-4 py-3">Ilegal (exceto beneficentes)</div>
                  <div className="px-4 py-3">R$5-10 bilhões</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="px-4 py-3">Tigrinho e slots online</div>
                  <div className="px-4 py-3">Regulamentado em 2025; fraudes comuns</div>
                  <div className="px-4 py-3">R$50-100 bilhões</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="px-4 py-3 font-semibold">Total Jogos de Azar</div>
                  <div className="px-4 py-3">Misto</div>
                  <div className="px-4 py-3">R$400-500 bilhões (legal + ilegal)</div>
                </div>
              </div>
            </div>
            <p className="text-foreground/90">
              Demanda e Potencial: A regulamentação de 2025 (Lei 14.790) abre espaço para plataformas legais como Ganhavel, que pode migrar usuários de mercados ilegais (R$100B TAM estimado para rifas + slots) para um modelo validado pela Loteria Federal, com segurança e escalabilidade via marketing viral e comunidade gamificada.
            </p>
          </CardContent>
        </Card>

        {/* Estrutura do Investimento */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              Estrutura do Investimento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border">
                <div className="font-semibold mb-2">Exclusividade transações x tempo</div>
                <p className="text-sm text-muted-foreground">A definir em comum acordo (parceria estratégica).</p>
              </div>
              <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border">
                <div className="font-semibold mb-2">Shares</div>
                <p className="text-sm text-muted-foreground">3–5% (fase inicial) conforme aporte e metas.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border">
                <div className="font-semibold mb-2">Fontes de Receita</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Taxa fixa por transação: R$2,00 por venda confirmada</li>
                  <li>Margem sobre valor do prêmio: 2% inicial, com possibilidade de aumento até 8–15% conforme escala</li>
                  <li>Prêmios e produtos afiliados: Produtos próprios ou de parceiros integrados à plataforma</li>
                  <li>Destaques e promoções internas: Posição privilegiada nas páginas e vitrines de categorias</li>
                  <li>Comissões de parceiros: Somente em conformidade legal (avaliar formatos permitidos)</li>
                  <li>Marketing viral: Monetização via conteúdos, campanhas e rankings de usuários</li>
                  <li>Rede Social de Ganhadores: Comunidade gamificada com rankings, interações e engajamento social</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projeções e Valuações */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <PieChart className="w-6 h-6 text-primary" />
              </div>
              Projeções e Valuações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-foreground/90">
              Projeções de Crescimento (3 anos) — Baseado em TAM de R$100B (rifas + slots online), com receita média de 10% do GTV (R$2/trans + 2% prêmio) e múltiplo de valuação 10x receita no Ano 3.
            </p>
            <div className="overflow-hidden rounded-xl border divide-y">
              <div className="grid grid-cols-6 bg-muted/40 text-muted-foreground text-sm font-medium">
                <div className="px-4 py-3">Cenário</div>
                <div className="px-4 py-3">Captura Mercado (Ano 3)</div>
                <div className="px-4 py-3">Receita Ano 1</div>
                <div className="px-4 py-3">Receita Ano 2</div>
                <div className="px-4 py-3">Receita Ano 3</div>
                <div className="px-4 py-3">Valuação (Ano 3)</div>
              </div>
              <div className="grid grid-cols-6">
                <div className="px-4 py-3">Conservador</div>
                <div className="px-4 py-3">5% (R$5B GTV)</div>
                <div className="px-4 py-3">R$100M</div>
                <div className="px-4 py-3">R$200M</div>
                <div className="px-4 py-3">R$500M</div>
                <div className="px-4 py-3">R$5 bilhões</div>
              </div>
              <div className="grid grid-cols-6">
                <div className="px-4 py-3">Moderado</div>
                <div className="px-4 py-3">15% (R$15B GTV)</div>
                <div className="px-4 py-3">R$200M</div>
                <div className="px-4 py-3">R$600M</div>
                <div className="px-4 py-3">R$1.5B</div>
                <div className="px-4 py-3">R$15 bilhões</div>
              </div>
              <div className="grid grid-cols-6">
                <div className="px-4 py-3">Agressivo</div>
                <div className="px-4 py-3">30% (R$30B GTV)</div>
                <div className="px-4 py-3">R$400M</div>
                <div className="px-4 py-3">R$1.2B</div>
                <div className="px-4 py-3">R$3B</div>
                <div className="px-4 py-3">R$30 bilhões</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border">
                <div className="font-semibold">Se capturarmos 5% do mercado</div>
                <div className="text-sm text-muted-foreground">Valuação de R$5 bilhões em 3 anos</div>
              </div>
              <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border">
                <div className="font-semibold">Se capturarmos 15% do mercado</div>
                <div className="text-sm text-muted-foreground">Valuação de R$15 bilhões em 3 anos</div>
              </div>
              <div className="p-4 rounded-xl bg-white/60 dark:bg-black/20 border">
                <div className="font-semibold">Se capturarmos 30% do mercado</div>
                <div className="text-sm text-muted-foreground">Valuação de R$30 bilhões em 3 anos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Oportunidade de Marketing e Viralidade */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              Oportunidade de Marketing e Viralidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <ul className="list-disc pl-5 space-y-2">
              <li>Quem lança o ganhavel (link ou produto) → compartilha para vender</li>
              <li>Quem compra → compartilha para que o sorteio aconteça → viralidade orgânica</li>
              <li>Transformamos a plataforma em uma rede social de sorteios honestos, com suporte e engajamento comunitário</li>
              <li>Potencial de expansão via marketing de influência e afiliados massivos</li>
              <li>Pacotes de marketing envolvendo influencers, jatinhos, cruzeiros e prêmios virais para grande alcance orgânico</li>
            </ul>
          </CardContent>
        </Card>

        {/* Blindagem e Observações Legais */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              Blindagem e Observações Legais
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            <ul className="list-disc pl-5 space-y-2">
              <li>Não retemos dinheiro de sorteios (fundos ficam com o organizador)</li>
              <li>Sorteios validados pela Caixa Econômica / Loteria Federal</li>
              <li>Não recebemos valores diretamente do sorteio — atuamos como facilitadora tecnológica e de marketing</li>
              <li>Modelo estruturado para minimizar riscos regulatórios e fiscais</li>
            </ul>
          </CardContent>
        </Card>

        {/* Roadmap de Execução */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              Roadmap de Execução
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>MVP funcional: ✅</li>
              <li>Finalização do back-end em 3/5 dias</li>
              <li>Lançamento oficial até 10/14 dias (fingers crossed)</li>
              <li>Ativação de afiliados: mês 1–2</li>
              <li>Validação de mercado imediata: mês 1/2 (fingers crossed)</li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Handshake className="w-5 h-5 mr-2" />
                Fechar Acordo
              </Button>
              <Button variant="outline" size="lg" className="hover-scale">
                <Target className="w-5 h-5 mr-2" />
                Agendar Reunião
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investment;