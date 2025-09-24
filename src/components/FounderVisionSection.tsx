import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Zap, Users, Target, Lightbulb, Briefcase } from 'lucide-react';
import founderPhoto from '@/assets/founder-felipe.png';

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
                Profissional de automação, inspirado pela revolução de IA.
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
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow-lg">
                  <img 
                    src={founderPhoto} 
                    alt="Felipe Ribeiro, Fundador da Ganhavel" 
                    className="w-full h-full object-cover"
                  />
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
                <h3 className="text-2xl font-bold mb-6">Temos a intenção de ser mais que uma plataforma de sorteios.</h3>
                <p className="text-lg leading-relaxed opacity-95">
                  Um novo canal de vendas, engajamento e conteúdo, capaz de consolidar a Kabum 
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

      </div>
    </section>
  );
};

export default FounderVisionSection;