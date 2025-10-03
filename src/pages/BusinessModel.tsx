import React from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket, Target, LineChart, Users, Shield, TrendingUp, DollarSign, Share2, Zap, Globe2, Handshake, BarChart3, AlertTriangle, Trophy, Calendar, Building, CheckCircle } from 'lucide-react';

const ogImage = '/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png';

const BusinessModel: React.FC = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Ganhavel — Business Model',
    description: 'Modelo que conecta prêmios reais, sorteios e afiliados em um ecossistema transparente e escalável.',
    author: { '@type': 'Organization', name: 'Ganhavel' },
    publisher: { '@type': 'Organization', name: 'Ganhavel' }
  } as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <SEOHead
        title="Ganhavel — Business Model"
        description="Modelo que conecta prêmios reais, sorteios e afiliados em um ecossistema transparente e escalável."
        ogImage={ogImage}
        structuredData={structuredData}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover-scale group">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                <img src={'/lovable-uploads/90a8d604-6da6-4291-867b-8c11ee03620e.png'} alt="Ganhavel Logo" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:block">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Ganhavel</h2>
                <p className="text-xs text-muted-foreground">Sorteios Reais</p>
              </div>
            </Link>
            <Badge variant="outline" className="border-primary/30 text-primary">Business Model</Badge>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="container mx-auto px-4 py-16 max-w-4xl relative">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Rocket className="w-4 h-4" />
              Business Model
            </div>
            <h1 className="text-5xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Ganhavel — Business Model</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">O modelo que conecta prêmios reais, sorteios e afiliados em um ecossistema transparente e escalável.</p>
            <div className="flex justify-center gap-4 mt-8">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                <Link to="/descobrir">
                  <Target className="w-5 h-5 mr-2" />
                  Descobrir
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="hover-scale">
                <Link to="/como-funciona">
                  <LineChart className="w-5 h-5 mr-2" />
                  Como Funciona
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Visão Geral */}
        <Card className="mb-12 border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400 text-2xl">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              Visão Geral — MVP Pronto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              Ganhavel é uma plataforma onde qualquer pessoa pode lançar, participar e promover sorteios de prêmios reais ("ganhaveis").
              Oferecemos produtos diversos: físicos, digitais, afiliados, próprios, alheios e virais.
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
              <div className="text-sm">Modelo simples: <span className="font-semibold">Publica → Vende → Sorteia → Entrega</span></div>
              <div className="text-sm text-muted-foreground">Pagamento seguro: liberado somente com confirmação de entrega</div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="text-sm">Segurança total com validação via Loteria Federal</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
                <span className="text-sm">Produtos afiliados próprios, links próprios</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
                <span className="text-sm">Infinitas fontes de renda e marketing viral</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm">Escalável e transparente</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análise de Mercado */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-orange-50/80 to-red-50/60 dark:from-orange-950/30 dark:to-red-950/20 border-orange-200/50 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-orange-700 dark:text-orange-400 text-2xl">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              Análise de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              O mercado de jogos de azar no Brasil é explosivo, com uma demanda reprimida por opções legais e seguras. 
              Ganhavel posiciona-se para capturar usuários de rifas ilegais e jogos como o "Tigrinho", oferecendo uma plataforma regulada, transparente e com viralidade orgânica.
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-full bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-2 font-semibold">Modalidade</th>
                      <th className="text-left p-2 font-semibold">Legalidade</th>
                      <th className="text-left p-2 font-semibold">Faturamento 2025 (Estimado)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="p-2">Rifas (pessoa física/online)</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Ilegal (exceto beneficentes)
                        </Badge>
                      </td>
                      <td className="p-2 font-semibold">R$5-10 bilhões</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2">Tigrinho e slots online</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Regulamentado em 2025; fraudes comuns
                        </Badge>
                      </td>
                      <td className="p-2 font-semibold">R$50-100 bilhões</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold">Total Jogos de Azar</td>
                      <td className="p-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Misto
                        </Badge>
                      </td>
                      <td className="p-2 font-bold text-primary">R$400-500 bilhões (legal + ilegal)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm">
                <span className="font-semibold">Demanda e Potencial:</span> A regulamentação de 2025 (Lei 14.790) abre espaço para plataformas legais como Ganhavel, 
                que pode migrar usuários de mercados ilegais (R$100B TAM estimado para rifas + slots) para um modelo validado pela Loteria Federal, 
                com segurança e escalabilidade via marketing viral e comunidade gamificada.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Concorrentes e Diferenciais */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200/50 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-blue-700 dark:text-blue-400 text-2xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              Concorrentes e Diferenciais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              Plataformas como 123Rifas, Rifa Tech, Rife-me e Rifa 321 dominam as rifas online no Brasil, 
              porém atuam em zona cinzenta legal, com prêmios limitados e pouca automação. A Ganhavel resolve esses pontos com validação pela Loteria Federal e fluxo 100% automatizado.
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-full bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-2 font-semibold">Aspecto</th>
                      <th className="text-left p-2 font-semibold">Plataformas Existentes</th>
                      <th className="text-left p-2 font-semibold text-primary">Ganhavel</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Legal</td>
                      <td className="p-2">Frequentemente sem SPA/MF; risco.</td>
                      <td className="p-2 text-primary font-medium">Validação Loteria Federal + pagamento só após entrega.</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Prêmios</td>
                      <td className="p-2">Principalmente físicos/beneficentes.</td>
                      <td className="p-2 text-primary font-medium">Físicos, digitais, afiliados e virais — sem estoque.</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Receita</td>
                      <td className="p-2">Taxas fixas ou comissões altas.</td>
                      <td className="p-2 text-primary font-medium">Taxa + % afiliados + rifas de créditos de mídia.</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Transparência</td>
                      <td className="p-2">Baseada na confiança, sem prova.</td>
                      <td className="p-2 text-primary font-medium">Comprovantes, confirmação de entrega, validação por loteria.</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Automação</td>
                      <td className="p-2">Pagamentos básicos.</td>
                      <td className="p-2 text-primary font-medium">Onboarding no‑code, IA e antifraude integrados.</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Mercado</td>
                      <td className="p-2">Foco Brasil.</td>
                      <td className="p-2 text-primary font-medium">Pronta para BRL/USD/EUR e multi‑idiomas.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Marketing</td>
                      <td className="p-2">Divulgação por organizador.</td>
                      <td className="p-2 text-primary font-medium">Viralização, rifas de afiliados e recompensas sociais.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fases do Modelo */}
        <Card className="mb-12 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-border/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              Fases do Modelo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 p-6 rounded-xl border border-blue-200/50">
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Fase 1 – Desenvolvimento e Preparação ✅ COMPLETA</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>Finalização de funcionalidades e back-end</li>
                  <li>Estrutura de integrações com marketplaces e ferramentas SaaS</li>
                  <li>Testes com usuários iniciais e ajustes de usabilidade</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 p-6 rounded-xl border border-emerald-200/50">
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">Fase 2 – Lançamento e Ativação</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-emerald-800 dark:text-emerald-200">
                  <li>Lançamento oficial da plataforma</li>
                  <li>Ativação do programa de afiliados</li>
                  <li>Parcerias com criadores de conteúdo e empresas estratégicas</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 p-6 rounded-xl border border-purple-200/50">
                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2">Fase 3 – Crescimento e Expansão</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-purple-800 dark:text-purple-200">
                  <li>Escalabilidade técnica e otimização</li>
                  <li>Marketing de alto impacto e viralidade</li>
                  <li>Expansão para novos mercados e categorias</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Receita */}
        <Card className="mb-12 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              Fontes de Receita
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Important Notice */}
            <div className="text-center p-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/20 rounded-xl border border-emerald-200/50">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                A Ganhavel não recebe qualquer valor sobre o valor do ganhavel
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">
                Fontes de Renda - Afiliados próprios e parcerias legalizadas
              </div>
            </div>

            {/* Financial Institution Notice */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200/50">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <span className="font-semibold">Taxas financeiras:</span> R$2 por transação e 2% do valor arrecadado é cobrado pela instituição financeira que garante a segurança dos fundos e liberações
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3 p-6 rounded-lg bg-white/60 dark:bg-black/20 border border-accent/30">
                <Trophy className="w-6 h-6 text-accent mt-0.5" />
                <div>
                  <div className="font-semibold text-accent mb-2">Afiliados</div>
                  <div className="text-sm text-foreground/80">
                    Produtos afiliados próprios integrados à plataforma
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-6 rounded-lg bg-white/60 dark:bg-black/20 border border-primary/30">
                <Handshake className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold text-primary mb-2">Comissão de Parceiros Estratégicos</div>
                  <div className="text-sm text-foreground/80">
                    Parcerias legalizadas e em conformidade legal
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projeções e Valuações */}
        <Card className="mb-12 overflow-hidden border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400 text-2xl">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              Projeções e Valuações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              Projeções de Crescimento (3 anos) — Baseado em TAM de R$100B (rifas + slots online), 
              com receita média de 10% do GTV (R$2/trans + 2% prêmio) e múltiplo de valuação 10x receita no Ano 3.
            </p>
            <div className="overflow-x-auto">
              <div className="min-w-full bg-white/60 dark:bg-black/20 rounded-lg p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left p-2 font-semibold">Cenário</th>
                      <th className="text-left p-2 font-semibold">Captura Mercado (Ano 3)</th>
                      <th className="text-left p-2 font-semibold">Receita Ano 1</th>
                      <th className="text-left p-2 font-semibold">Receita Ano 2</th>
                      <th className="text-left p-2 font-semibold">Receita Ano 3</th>
                      <th className="text-left p-2 font-semibold">Valuação (Ano 3)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Conservador</td>
                      <td className="p-2">5% (R$5B GTV)</td>
                      <td className="p-2">R$100M</td>
                      <td className="p-2">R$200M</td>
                      <td className="p-2">R$500M</td>
                      <td className="p-2 font-bold text-green-600">R$5 bilhões</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="p-2 font-medium">Moderado</td>
                      <td className="p-2">15% (R$15B GTV)</td>
                      <td className="p-2">R$200M</td>
                      <td className="p-2">R$600M</td>
                      <td className="p-2">R$1.5B</td>
                      <td className="p-2 font-bold text-blue-600">R$15 bilhões</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Agressivo</td>
                      <td className="p-2">30% (R$30B GTV)</td>
                      <td className="p-2">R$400M</td>
                      <td className="p-2">R$1.2B</td>
                      <td className="p-2">R$3B</td>
                      <td className="p-2 font-bold text-primary">R$30 bilhões</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-300/50">
                <div className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-semibold">Se capturarmos 5% do mercado</span><br />
                  Valuação de R$5 bilhões em 3 anos
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-300/50">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Se capturarmos 15% do mercado</span><br />
                  Valuação de R$15 bilhões em 3 anos
                </div>
              </div>
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg border border-primary/30">
                <div className="text-sm text-primary">
                  <span className="font-semibold">Se capturarmos 30% do mercado</span><br />
                  Valuação de R$30 bilhões em 3 anos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Oportunidade de Marketing e Viralidade */}
        <Card className="mb-12 overflow-hidden border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Share2 className="w-6 h-6 text-accent" />
              </div>
              Oportunidade de Marketing e Viralidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              Transformamos a plataforma em uma rede social de sorteios honestos, com suporte e engajamento comunitário.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Quem lança o ganhavel (link ou produto) → compartilha para vender',
                'Quem compra → compartilha para que o sorteio aconteça → viralidade orgânica',
                'Potencial de expansão via marketing de influência e afiliados massivos',
                'Pacotes de marketing envolvendo influencers, jatinhos, cruzeiros e prêmios virais para grande alcance orgânico',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border border-border/50">
                  <Globe2 className="w-5 h-5 text-accent" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missão */}
        <Card className="mb-12 overflow-hidden border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-violet-50/60 dark:from-purple-950/30 dark:to-violet-950/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-purple-700 dark:text-purple-400 text-2xl">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              Missão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed text-foreground/90">
              Transformar milhões em protagonistas da própria renda, permitindo que, de forma responsável e segura, 
              lancem prêmios — inclusive de afiliados — e alcancem novas oportunidades de ganho e conexão.
            </p>
          </CardContent>
        </Card>

        {/* Blindagem e Observações Legais */}
        <Card className="mb-12 overflow-hidden border-yellow-200/50 bg-gradient-to-br from-yellow-50/80 to-amber-50/60 dark:from-yellow-950/30 dark:to-amber-950/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400 text-2xl">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              Blindagem e Observações Legais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Não retemos dinheiro de sorteios (fundos ficam com o organizador)',
                'Sorteios validados pela Caixa Econômica / Loteria Federal',
                'Não recebemos valores diretamente do sorteio — atuamos como facilitadora tecnológica e de marketing',
                'Modelo estruturado para minimizar riscos regulatórios e fiscais',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border border-yellow-300/50">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Parcerias Estratégicas */}
        <Card className="mb-12 overflow-hidden border-border/50 bg-gradient-to-br from-background to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Handshake className="w-6 h-6 text-primary" />
              </div>
              Parcerias Estratégicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Buscamos parceiros em cinco frentes:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li><span className="text-foreground">Profissionais</span> — desenvolvedores, designers, marketing, gestão de comunidade</li>
                <li><span className="text-foreground">Criadores de Conteúdo</span> — influenciadores digitais, educadores e empreendedores</li>
                <li><span className="text-foreground">Empresas & Plataformas</span> — agências, marketplaces, SaaS, soluções financeiras</li>
                <li><span className="text-foreground">Varejistas & Fornecedores</span> — vendedores diretos de produtos e prêmios para a plataforma</li>
                <li><span className="text-foreground">Parceiros de Expansão</span> — mídia, tecnologia e presença internacional</li>
              </ul>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-6 rounded-xl border border-border/50">
              <p className="text-sm"><span className="font-semibold">Win–Win:</span> Cada parceria gera valor para ambos os lados, fortalecendo a rede e ampliando o alcance da plataforma.</p>
            </div>
          </CardContent>
        </Card>

        {/* Fase 1 desenvolvimento - Completa */}
        <Card className="mb-12 overflow-hidden border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/60 dark:from-green-950/30 dark:to-emerald-950/20 hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700 dark:text-green-400 text-2xl">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              Fase 1 desenvolvimento - Completa
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 rounded-lg border border-green-300/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
                <span className="text-lg font-semibold text-green-800 dark:text-green-200">MVP Funcional Finalizado</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Plataforma completa com funcionalidades core implementadas, validação pela Loteria Federal integrada e sistema de pagamentos seguro.
              </p>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
};

export default BusinessModel;
