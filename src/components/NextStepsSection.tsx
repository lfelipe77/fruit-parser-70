import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Settings, Rocket, BarChart3, TrendingUp, CheckCircle } from 'lucide-react';

const NextStepsSection = () => {
  const steps = [
    {
      number: 1,
      icon: PlayCircle,
      title: "Testar a plataforma",
      description: "Gostaria de convidar o time da Magalu para lançarem um ganhável simples (R$ 9–10), comprarem bilhetes e conferirem o funcionamento. Qualquer gasto, faço questão de reembolsar imediatamente. 🙂",
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10"
    },
    {
      number: 2,
      icon: Settings,
      title: "Escolher o modelo de parceria",
      description: "Definir a opção inicial (1, 2 ou 3).",
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10"
    },
    {
      number: 3,
      icon: Rocket,
      title: "Piloto com produto Magalu",
      description: "Ativar influenciadores e acompanhar a dinâmica gamificada com produto real da Magalu.",
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-50 dark:from-purple-900/10 dark:to-violet-900/10"
    },
    {
      number: 4,
      icon: BarChart3,
      title: "Medir impacto",
      description: "Analisar engajamento, audiência, conversões e cobertura orgânica com métricas detalhadas.",
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10"
    },
    {
      number: 5,
      icon: TrendingUp,
      title: "Escalar",
      description: "Ampliar campanhas e avaliar evolução para parceria estratégica de longo prazo.",
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 text-foreground">Próximos Passos — Como Avançar</h2>
          <p className="text-xl text-muted-foreground">
            Um roadmap claro para iniciar nossa parceria
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line - hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 via-blue-500 via-purple-500 via-orange-500 to-pink-500 rounded-full opacity-30" />
          
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div key={index} className={`relative grid md:grid-cols-2 gap-8 items-center ${isEven ? '' : 'md:direction-rtl'}`}>
                  {/* Step Content */}
                  <div className={`${isEven ? 'md:text-right' : 'md:text-left md:order-2'}`}>
                    <Card className={`p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br ${step.bgColor}`}>
                      <CardContent className="space-y-4">
                        <div className={`flex items-center space-x-4 ${isEven ? 'md:flex-row-reverse md:space-x-reverse' : ''}`}>
                          <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">
                              Passo {step.number}
                            </div>
                            <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Center Circle */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white dark:bg-gray-800 rounded-full border-4 border-gray-200 dark:border-gray-700 items-center justify-center z-10">
                    <div className={`w-8 h-8 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{step.number}</span>
                    </div>
                  </div>

                  {/* Empty space for alignment */}
                  <div className={`hidden md:block ${isEven ? 'md:order-2' : ''}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
            <CardContent>
              <h3 className="text-2xl font-bold mb-4">Adoraríamos saber a opinião do time Magalu</h3>
              <p className="text-lg opacity-90 mb-6">
                e agendar uma conversa para discutir qual modelo de parceria pode fazer mais sentido para iniciar.
              </p>
              <Button size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                <CheckCircle className="w-5 h-5 mr-2" />
                Agendar Demonstração
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default NextStepsSection;