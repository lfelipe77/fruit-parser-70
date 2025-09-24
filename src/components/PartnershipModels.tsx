import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Crown, TrendingUp, DollarSign, Zap } from 'lucide-react';

const PartnershipModels = () => {
  const models = [
    {
      title: "Integração Básica",
      subtitle: "Opção 1",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10",
      borderColor: "border-green-200",
      description: "Continuar listando produtos Magalu como ganháveis (junto a outros parceiros).",
      details: "Sem qualquer adaptação, ideal para validar tração inicial.",
      highlight: "Risco zero"
    },
    {
      title: "Rede de Influenciadores", 
      subtitle: "Opção 2",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10", 
      borderColor: "border-blue-200",
      description: "Magalu integra o Ganhavel.com à sua rede de influenciadores e parceiros estratégicos.",
      details: "Influenciadores promovem produtos Magalu como ganháveis, unindo conteúdo + gamificação + venda fracionada por sorteio.",
      highlight: "Alcance orgânico"
    },
    {
      title: "Estratégia Exclusiva",
      subtitle: "Opção 3", 
      icon: Crown,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10",
      borderColor: "border-purple-200",
      description: "\"Ganhavel by Magalu\": total exclusividade, controle e decisões estratégicas alinhadas à marca/produtos.",
      details: "Time dedicado para explorar o potencial completo: growth, gamificação, conteúdo, dados.",
      highlight: "Potencial máximo"
    }
  ];

  const revenueStreams = [
    {
      icon: DollarSign,
      title: "Taxa por transação",
      description: "R$ 2 por transação + 2% escrow (atual), com possibilidade de elevar para 10–15%",
      color: "text-green-600"
    },
    {
      icon: TrendingUp,
      title: "Afiliados + Destaques",
      description: "Canais exclusivos, parcerias premium e Super High Ticket Ganháveis",
      color: "text-blue-600"
    },
    {
      icon: Zap,
      title: "Marketing embutido",
      description: "Redistribuição para influenciadores em modelo de competição saudável",
      color: "text-purple-600"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-900/50 dark:to-blue-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Modelos de Parceria</h2>
          <p className="text-xl text-muted-foreground">
            Três opções flexíveis para começar nossa colaboração
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {models.map((model, index) => {
            const Icon = model.icon;
            return (
              <Card 
                key={index}
                className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${model.bgColor} ${model.borderColor} relative overflow-hidden`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-sm font-medium">
                      {model.subtitle}
                    </Badge>
                    <Badge className={`bg-gradient-to-r ${model.color} text-white`}>
                      {model.highlight}
                    </Badge>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${model.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {model.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {model.description}
                  </p>
                  <p className="text-sm text-muted-foreground/80 italic">
                    {model.details}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Revenue Streams */}
        <Card className="p-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200">
          <CardContent>
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
              Fontes de Renda (modelo atual, público)
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {revenueStreams.map((stream, index) => {
                const Icon = stream.icon;
                return (
                  <div key={index} className="text-center space-y-4">
                    <div className={`w-16 h-16 ${stream.color} bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-lg`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-foreground">{stream.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {stream.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Special Spotlight */}
        <Card className="mt-8 p-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white">
          <CardContent>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Sorteios dos Sonhos</h3>
              <p className="text-lg opacity-90 mb-6">
                Casa completa Magalu + collabs exclusivos com visual aspiracional
              </p>
              <div className="flex justify-center items-center space-x-4">
                <div className="text-3xl font-bold">🏡</div>
                <div className="text-2xl">+</div>
                <div className="text-3xl font-bold">📱</div>
                <div className="text-2xl">+</div>
                <div className="text-3xl font-bold">🎮</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PartnershipModels;