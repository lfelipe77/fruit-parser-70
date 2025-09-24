import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Zap, Users, Target, Lightbulb, Briefcase } from 'lucide-react';

const FounderVisionSection = () => {
  const founderHighlights = [
    {
      icon: Globe,
      title: "20 anos internacionais",
      description: "Reino Unido, EUA, França, Espanha",
      color: "text-blue-600"
    },
    {
      icon: Briefcase,
      title: "Múltiplas empresas",
      description: "Empreendedor serial e especialista em automação",
      color: "text-green-600"
    },
    {
      icon: Zap,
      title: "Revolução da IA",
      description: "Execução rápida de projetos antes impensáveis",
      color: "text-purple-600"
    }
  ];

  const visionPoints = [
    {
      icon: Target,
      title: "Novo canal de vendas",
      description: "Transformando como produtos são comercializados"
    },
    {
      icon: Users,
      title: "Engajamento revolucionário",
      description: "Experiências que conectam marcas e consumidores"
    },
    {
      icon: Lightbulb,
      title: "Inovação transparente",
      description: "Pioneirismo em modelo honesto e auditável"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Founder Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="mb-8">
              <Badge variant="outline" className="mb-4 text-sm">
                Fundador & Visionário
              </Badge>
              <h2 className="text-4xl font-bold mb-4 text-foreground">Felipe Ribeiro</h2>
              <p className="text-xl text-muted-foreground mb-6">
                Fundador da Ganhavel
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Profissional de automação, empreendedor em múltiplas empresas e startups.
                Viveu cerca de 20 anos fora do Brasil (Reino Unido, EUA, França, Espanha).
                Apaixonado pela revolução da IA e pela execução rápida e eficiente de projetos antes impensáveis.
              </p>
            </div>

            <div className="space-y-4">
              {founderHighlights.map((highlight, index) => {
                const Icon = highlight.icon;
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${highlight.color} bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{highlight.title}</h4>
                      <p className="text-sm text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border-blue-200">
            <CardContent>
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl font-bold text-white">FR</span>
                </div>
                <blockquote className="text-lg italic text-muted-foreground leading-relaxed">
                  "A tecnologia deve servir para conectar pessoas e criar experiências genuínas. 
                  A Ganhavel representa essa visão: transparência, inovação e impacto real na vida das pessoas."
                </blockquote>
                <cite className="block mt-4 text-sm font-medium text-foreground">
                  — Felipe Ribeiro, Fundador
                </cite>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto w-3/4 mb-20" />

        {/* Vision Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Visão de Futuro</h2>
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 text-white">
              <CardContent>
                <h3 className="text-2xl font-bold mb-6">A Ganhavel é mais que uma plataforma de sorteios.</h3>
                <p className="text-lg leading-relaxed opacity-95">
                  É um novo canal de vendas, engajamento e conteúdo, capaz de consolidar a Magalu 
                  como pioneira em um modelo transparente, gamificado e acessível, abrindo caminho 
                  para explorar um mercado bilionário com inovação, impacto e confiança.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Vision Points */}
        <div className="grid md:grid-cols-3 gap-8">
          {visionPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">{point.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{point.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Market Opportunity */}
        <Card className="mt-16 p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200">
          <CardContent>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Oportunidade de Mercado</h3>
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">R$ 50B</div>
                  <div className="text-sm text-muted-foreground">Mercado de e-commerce BR</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
                  <div className="text-sm text-muted-foreground">Crescimento em gamificação</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">120M</div>
                  <div className="text-sm text-muted-foreground">Usuários ativos online</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FounderVisionSection;