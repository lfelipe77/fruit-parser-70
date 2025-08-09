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
            <a 
              href="/" 
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
            </a>
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
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card className="h-full border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20 hover-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400 text-2xl">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  Visão Geral
                  <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                    MVP Pronto
                  </Badge>
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
          </div>
          
          {/* Stats Sidebar */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover-scale">
              <CardContent className="p-6 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-primary">15%</div>
                <div className="text-sm text-muted-foreground">Equity Fase 1</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 hover-scale">
              <CardContent className="p-6 text-center">
                <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">R$ 165K</div>
                <div className="text-sm text-muted-foreground">Investimento Total</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 hover-scale">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">6</div>
                <div className="text-sm text-muted-foreground">Meses de Runway</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estrutura do Investimento */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              Estrutura do Investimento
              <Badge variant="outline" className="ml-auto">Fase 1 + 2</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute left-8 top-12 bottom-0 w-px bg-gradient-to-b from-blue-400 to-blue-600"></div>
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      1-3M
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-blue-600 mb-1">
                        Fase 1 – Até o Lançamento
                      </h3>
                      <p className="text-muted-foreground">Meses 1 a 3 • Desenvolvimento e Preparação</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 ml-20">
                    <div className="group hover-scale">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-xl border border-blue-200/50 transition-all group-hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Users className="w-5 h-5 text-blue-600" />
                          <div className="font-semibold text-blue-900 dark:text-blue-300">Felipe (CEO)</div>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">R$ 10K–20K/mês</div>
                        <div className="text-xs text-blue-600/70">média inicial de R$ 10K</div>
                      </div>
                    </div>
                    <div className="group hover-scale">
                      <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 p-6 rounded-xl border border-green-200/50 transition-all group-hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Settings className="w-5 h-5 text-green-600" />
                          <div className="font-semibold text-green-900 dark:text-green-300">Suporte de Desenvolvedores</div>
                        </div>
                        <div className="text-2xl font-bold text-green-600 mb-1">1/5 do orçamento</div>
                        <div className="text-xs text-green-600/70">capacidade sob demanda</div>
                      </div>
                    </div>
                    <div className="group hover-scale">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 p-6 rounded-xl border border-purple-200/50 transition-all group-hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Zap className="w-5 h-5 text-purple-600" />
                          <div className="font-semibold text-purple-900 dark:text-purple-300">Ferramentas e Infraestrutura</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-600 mb-1">1/5 do orçamento</div>
                        <div className="text-xs text-purple-600/70">VEO 3, Lovable, Email/Supabase, etc.</div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-20">
                    <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                      Investimento inicial: R$ 30K–60K (3 meses) • Equity: 15% + suporte estratégico
                    </Badge>
                  </div>
                  <div className="ml-20 mt-4 text-sm text-muted-foreground">
                    <div className="font-medium">Ferramentas principais:</div>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>VEO 3 — USD 250/mês</li>
                      <li>Lovable (fase desenvolvimento) — USD 150/mês</li>
                      <li>Lovable (pós-lançamento) — USD 50–100/mês</li>
                      <li>Email, Supabase, HopperHQ, CapCut — ~USD 100/mês</li>
                    </ul>
                  </div>
                </div>

                <div className="relative mt-12">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      4-6M
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-emerald-600 mb-1">
                        Fase 1 – Pós-lançamento
                      </h3>
                      <p className="text-muted-foreground">Meses 4 a 6 • Crescimento e Marketing</p>
                    </div>
                  </div>
                  <div className="ml-20 space-y-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-6 rounded-xl border border-emerald-200/50">
                      <div className="text-emerald-700 dark:text-emerald-300 font-semibold mb-2">Investimento adicional</div>
                      <div className="text-2xl font-bold text-emerald-600">R$ 200K–1M</div>
                      <div className="text-sm text-emerald-700/80">para:</div>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-emerald-700 dark:text-emerald-300">
                        <li>Marketing de alto impacto</li>
                        <li>Aquisição de usuários</li>
                        <li>Escalabilidade técnica</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-12 mx-auto max-w-2xl">
                  <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-accent/15 p-8 rounded-2xl border border-primary/20 shadow-xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Rocket className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary mb-2">
                        30K a 60K Reais - Launch
                      </div>
                      <div className="text-lg font-medium text-primary">
                        + Support
                      </div>
                      <div className="text-2xl font-semibold text-accent mt-1">
                        15%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fase 2 */}
        <Card className="mb-12 overflow-hidden border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/20 shadow-lg hover-scale">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-blue-200/30">
            <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-400 text-2xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              Fase 2 — Pós-tração 
              <Badge variant="outline" className="ml-auto border-blue-300 text-blue-700">
                Opcional
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-100/80 to-indigo-100/60 dark:from-blue-900/30 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200/50">
                  <div className="flex items-center gap-3 mb-4">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-3xl font-bold text-blue-600">R$ 200K a R$ 1M</div>
                      <p className="text-blue-600/70">Aporte adicional</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xl font-semibold text-blue-700 dark:text-blue-400">
                      Até +15% de equity adicional
                    </div>
                    <p className="text-sm text-blue-600/80">
                      Investidor da Fase 1 tem prioridade (right of first refusal)
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-4 text-blue-700 dark:text-blue-400">Critérios de ativação:</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Usuários ativos e base engajada</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Receita gerada</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="font-medium">Engajamento e viralização de campanhas</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critérios para Avançar à Próxima Rodada */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Critérios para Avançar à Próxima Rodada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <span>MVP validado e rodando sem falhas críticas</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <span>Base inicial de usuários engajada</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                <span>Fluxos de monetização confirmados</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Receita */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Fontes de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Taxa fixa por transação</div>
                <div className="text-sm text-green-700 dark:text-green-300">R$ 2,00 por venda confirmada</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Margem sobre valor do prêmio</div>
                <div className="text-sm text-green-700 dark:text-green-300">2% inicial, com possibilidade de aumento progressivo até 8–15% conforme escala</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Prêmios e produtos afiliados</div>
                <div className="text-sm text-green-700 dark:text-green-300">Produtos próprios ou de parceiros integrados à plataforma</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Destaques e promoções internas</div>
                <div className="text-sm text-green-700 dark:text-green-300">Posição privilegiada nas páginas e vitrines de categorias</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Comissões de parceiros</div>
                <div className="text-sm text-green-700 dark:text-green-300">Somente em conformidade legal (avaliar formatos permitidos)</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Marketing viral</div>
                <div className="text-sm text-green-700 dark:text-green-300">Monetização via conteúdos, campanhas e rankings de usuários</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Rede Social de Ganhadores</div>
                <div className="text-sm text-green-700 dark:text-green-3 00">Comunidade gamificada com rankings, interações e engajamento social</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Oportunidade de Marketing e Viralidade */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-pink-600" />
              Oportunidade de Marketing e Viralidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>Quem lança o ganhavel (link ou produto) → compartilha para vender</div>
              <div>Quem compra → compartilha para que o sorteio aconteça → viralidade orgânica</div>
              <div>Transformamos a plataforma em uma rede social de sorteios honestos, com suporte e engajamento comunitário</div>
              <div>Potencial de expansão via marketing de influência e afiliados massivos</div>
              <div>Pacotes de marketing envolvendo influencers, jatinhos, cruzeiros e prêmios virais para grande alcance orgânico</div>
            </div>
          </CardContent>
        </Card>

        {/* Blindagem e Observações Legais */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-600" />
              Blindagem e Observações Legais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" /><span>Não retemos dinheiro de sorteios (fundos ficam com o organizador)</span></div>
              <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" /><span>Sorteios validados pela Caixa Econômica / Loteria Federal</span></div>
              <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" /><span>Não recebemos valores diretamente do sorteio — atuamos como facilitadora tecnológica e de marketing</span></div>
              <div className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" /><span>Modelo estruturado para minimizar riscos regulatórios e fiscais</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Roadmap de Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">MVP funcional</span>
                <Badge variant="default" className="bg-green-100 text-green-800">✅</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Finalização do back-end em +30 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Lançamento oficial até 90 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Ativação de afiliados: mês 3–4</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Validação de mercado: mês 4–6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termos da Parceria */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-6 h-6 text-blue-600" />
              Termos da Parceria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Gateway Oficial Para Growth</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Parceiro exclusivo (Se do interesse)</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Destaque como parceiro oficial</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Receita garantida: R$ 1,99/transação</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Societária */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-6 h-6 text-orange-600" />
              Distribuição Societária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">73%</div>
                <div className="text-sm font-medium">Luiz Felipe</div>
                <div className="text-xs text-muted-foreground">(Fundador)</div>
              </div>
              <div className="text-center bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">15%</div>
                <div className="text-sm font-medium">Investidor</div>
                <div className="text-xs text-muted-foreground">Fase 1</div>
              </div>
              <div className="text-center bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">até +15%</div>
                <div className="text-sm font-medium">Investidor</div>
                <div className="text-xs text-muted-foreground">Fase 2</div>
              </div>
              <div className="text-center bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">3%</div>
                <div className="text-sm font-medium">Possível desenvolvedor</div>
                <div className="text-xs text-muted-foreground">futuro</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condições de Performance */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="w-6 h-6" />
              Condições de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Contrato pode ser encerrado com aviso prévio de 3 meses</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Encerramento por falta de performance previamente definida</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Salários negociáveis com base em performance</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Acordo de sócios com cláusulas de proteção, vesting, saída e reinvestimento</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte Esperado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-600" />
              Suporte Esperado do Investidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Estrutura jurídica completa (CNPJ, contratos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Acordo societário profissional</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Suporte contábil e fiscal básico</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Network estratégico e mentoria</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Participação como advisor</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="relative bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/20">
            <CardTitle className="flex items-center gap-3 text-primary text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              Resumo Final da Oportunidade
              <Badge className="ml-auto bg-primary text-primary-foreground">
                Investimento Premium
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-primary/20">
                  <span className="text-3xl">📌</span>
                  <div>
                    <div className="font-bold text-lg">Investimento inicial: R$ 30K a R$ 60K por 15% equity + suporte estratégico</div>
                    <div className="text-sm text-muted-foreground">Fase 1</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-primary/20">
                  <span className="text-3xl">📈</span>
                  <div>
                    <div className="font-bold text-lg">Rodada seguinte: R$ 200K–1M, até +15% equity adicionais</div>
                    <div className="text-sm text-muted-foreground">prioridade para investidor Fase 1</div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-primary/20">
                  <span className="text-3xl">🔐</span>
                  <div>
                    <div className="font-bold text-lg">Eclusividade 3 anos — Parceiro Exclusivo — Partner crescimento</div>
                    <div className="text-sm text-muted-foreground">(se do interesse claro)</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/60 dark:bg-black/20 rounded-xl border border-primary/20">
                  <span className="text-3xl">💡</span>
                  <div>
                    <div className="font-bold text-lg">MVP funcional</div>
                    <div className="text-sm text-muted-foreground">Modelo validado e escalável</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-primary/20 via-primary/15 to-accent/20 p-8 rounded-2xl border border-primary/30 shadow-xl">
              <p className="text-xl font-bold text-center text-primary leading-relaxed">
                Investimento bootstrapping — viável para manter um bom desenvolvedor focado ou direcionar para outras infraestruturas estratégicas conforme a expansão.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg">
                  <Handshake className="w-5 h-5 mr-2" />
                  Fechar Acordo
                </Button>
                <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/10">
                  <Target className="w-5 h-5 mr-2" />
                  Agendar Reunião
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investment;