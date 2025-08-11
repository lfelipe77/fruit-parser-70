import React from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Rocket, Target, LineChart, Users, Shield, TrendingUp, DollarSign, Share2, Zap, Globe2, Handshake } from 'lucide-react';

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
              Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed text-foreground/90">
              Ganhavel é uma plataforma onde qualquer pessoa pode lançar, participar e promover sorteios de prêmios reais ("ganhaveis"),
              conectando produtos físicos, digitais, afiliados e virais a um ecossistema transparente e validado.
            </p>
            <div className="bg-white/60 dark:bg-black/20 p-4 rounded-lg">
              <div className="text-sm">Nosso modelo é simples: <span className="font-semibold">Publica → Compartilha → Vende → Sorteia → Entrega</span></div>
              <div className="text-sm text-muted-foreground">Sempre com validação pela Loteria Federal e segurança total no fluxo de entrega.</div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
                <span className="text-sm">Validação via Loteria Federal</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
                <span className="text-sm">Comunidade e afiliados</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/60 dark:bg-black/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm">Escalável e transparente</span>
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
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">Fase 1 – Desenvolvimento e Preparação</h3>
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
          <CardContent className="p-8 space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border border-primary/30">
              <DollarSign className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm text-foreground/90">
                <span className="font-semibold">Destaque:</span> Não retemos qualquer valor sobre os valores ou prêmios. Contamos com parceiro regulamentado que recebe: taxa por transação, taxa do valor / API money release — 2% (com potencial de ajuste no futuro).
                <div className="mt-2">
                  <Badge variant="outline" className="border-accent/40 text-accent">Produtos próprios & Afiliados</Badge>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Taxa por transação confirmada',
                'Prêmios e produtos afiliados',
                'Destaques e promoções internas',
                'Comissões de parceiros (em conformidade legal)',
                'Marketing viral e gamificação na comunidade de ganhadores',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border border-border/50">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Oportunidade de Viralidade */}
        <Card className="mb-12 overflow-hidden border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Share2 className="w-6 h-6 text-accent" />
              </div>
              Oportunidade de Viralidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-4">
            {[
              'Quem lança → compartilha para vender',
              'Quem compra → compartilha para que o sorteio aconteça',
              'Expansão natural via redes sociais, influenciadores e afiliados',
              'Pacotes especiais com experiências e prêmios virais',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 rounded-lg bg-white/60 dark:bg-black/20 border border-border/50">
                <Globe2 className="w-5 h-5 text-accent" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
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
              <h4 className="font-semibold mb-2">Buscamos parceiros em quatro frentes:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li><span className="text-foreground">Profissionais</span> — desenvolvedores, designers, marketing, gestão de comunidade</li>
                <li><span className="text-foreground">Criadores de Conteúdo</span> — influenciadores digitais, educadores e empreendedores</li>
                <li><span className="text-foreground">Empresas & Plataformas</span> — agências, marketplaces, SaaS, soluções financeiras</li>
                <li><span className="text-foreground">Parceiros de Expansão</span> — mídia, tecnologia e presença internacional</li>
              </ul>
            </div>
            <div className="bg-white/60 dark:bg-black/20 p-6 rounded-xl border border-border/50">
              <p className="text-sm"><span className="font-semibold">Win–Win:</span> Cada parceria gera valor para ambos os lados, fortalecendo a rede e ampliando o alcance da plataforma.</p>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="mb-12 overflow-hidden border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-2 gap-4">
            {[
              'MVP funcional validado',
              'Conclusão técnica e ajustes',
              'Ativação de afiliados e parcerias estratégicas',
              'Crescimento com base em comunidade, marketing e tecnologia',
            ].map((item) => (
              <div key={item} className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
                <div className="flex items-center gap-3">
                  <Rocket className="w-5 h-5 text-primary" />
                  <span className="text-sm">{item}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BusinessModel;
