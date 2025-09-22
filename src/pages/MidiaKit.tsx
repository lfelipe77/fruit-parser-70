import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Target, TrendingUp, Users, Zap, Check, ArrowRight, Trophy, Ticket } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";

export default function MidiaKit() {
  const examples = [
    {
      title: "Smart TV 43\" Aiwa – Americanas",
      url: "https://ganhavel.com/ganhavel/smart-tv-43-aiwa-da-americanas"
    },
    {
      title: "iPhone 17 – Magalu",
      url: "https://ganhavel.com/ganhavel/iphone-17-magalu-no-ganhavel-a-participe-e-concorra-agora"
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: "Exposição da marca nos Ganháveis mais populares",
      description: "Visibilidade massiva em produtos de alto engajamento"
    },
    {
      icon: TrendingUp,
      title: "Tráfego adicional para produtos via links de afiliados",
      description: "Conversões diretas através da gamificação"
    },
    {
      icon: Users,
      title: "Engajamento em campanhas sazonais e collabs",
      description: "Estratégias colaborativas e sazonais personalizadas"
    },
    {
      icon: Zap,
      title: "Inovação aberta e possibilidade de fusões estratégicas",
      description: "Parcerias tecnológicas e oportunidades de M&A"
    }
  ];

  return (
    <>
      <SEOHead
        title="Ganhavel – Kit de Mídia | Marketplace de Ganháveis"
        description="Kit de mídia oficial do Ganhavel. Marketplace transparente e tecnológico de prêmios, auditável pela Loteria Federal."
        canonical="https://ganhavel.com/midia-kit"
        noindex={true}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="py-16 px-4 border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ganhavel
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mb-6"></div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Marketplace de Ganháveis – Transparente, Tecnológico e Inovador
            </h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              O primeiro marketplace coletivo e gamificado de prêmios, auditável pela Loteria Federal.
            </p>
          </div>
        </section>

        {/* About Ganhavel */}
        <section className="py-16 px-4 border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Sobre o Ganhavel
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Plataforma democratizada:</strong> Qualquer pessoa pode lançar um Ganhável com links de afiliados e parcerias estratégicas.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Transparência absoluta:</strong> Todos os sorteios são auditáveis e vinculados à Loteria Federal.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Segurança tecnológica:</strong> Plataforma robusta com sistemas de pagamento seguros e conformidade regulatória.
                  </p>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">
                    <strong>Modelo sustentável:</strong> O sorteio só acontece quando 100% do valor do Ganhável é arrecadado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gamificação & Oportunidades */}
        <section className="py-16 px-4 border-b border-gray-100 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Gamificação & Oportunidades
            </h3>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <p className="text-lg text-gray-700">
                No Ganhavel, qualquer pessoa pode criar Ganháveis e lucrar através de afiliações e parcerias. 
                Nossa plataforma oferece um ambiente gamificado e viral que maximiza o engajamento.
              </p>
              
              <p className="text-lg text-gray-700">
                Marcas ganham visibilidade massiva e engajamento autêntico através de um ecossistema 
                inovador que transforma promoções tradicionais em experiências interativas e transparentes.
              </p>
            </div>
          </div>
        </section>

        {/* How Ganhavel Works - Visual Explanation */}
        <section className="py-20 px-4 border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Como Funciona o Ganhavel
            </h3>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Sistema transparente e auditável que garante fairness em todos os sorteios
            </p>
            
            {/* Step by Step Visual Flow */}
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {/* Step 1: Ganhável Creation */}
              <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">1. Criação do Ganhável</h4>
                  </div>
                  
                  {/* Mock Ganhável Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                    <div className="w-full h-24 bg-gray-300 rounded-md mb-3 flex items-center justify-center">
                      <span className="text-xs text-gray-500">iPhone 15 Pro</span>
                    </div>
                    <h5 className="font-semibold text-sm text-gray-800 mb-2">iPhone 15 Pro 256GB</h5>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Meta: R$ 6.000</span>
                      <span>R$ 15/bilhete</span>
                    </div>
                    <div className="text-xs text-gray-500">400 bilhetes total</div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Organizador define o prêmio, valor-meta e preço por bilhete
                  </p>
                </CardContent>
              </Card>

              {/* Step 2: Participation */}
              <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">2. Participação</h4>
                  </div>
                  
                  {/* Progress Visualization */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Arrecadado: R$ 4.800</span>
                      <span>80% concluído</span>
                    </div>
                    <ProgressBar value={80} showLabel={false} className="mb-3" />
                    <div className="text-xs text-gray-500 mb-2">320/400 bilhetes vendidos</div>
                    
                    {/* Sample Tickets */}
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-center">023</div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-center">156</div>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-center">289</div>
                    </div>
                    <div className="text-xs text-gray-500">Seus números: 3 bilhetes</div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Usuários compram bilhetes e recebem números únicos
                  </p>
                </CardContent>
              </Card>

              {/* Step 3: Draw */}
              <Card className="border border-gray-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">3. Sorteio</h4>
                  </div>
                  
                  {/* Completed State */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 mb-4 border border-green-200">
                    <div className="flex items-center justify-center mb-3">
                      <Check className="h-6 w-6 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">100% CONCLUÍDO</span>
                    </div>
                    <ProgressBar value={100} showLabel={false} className="mb-3" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-800 mb-1">Número sorteado:</div>
                      <div className="bg-white border-2 border-red-300 rounded-lg p-2 text-center">
                        <span className="text-lg font-bold text-red-600">07.156</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Loteria Federal: 25.156</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Sorteio acontece quando meta é 100% atingida
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Number Matching Explanation */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Sistema de Correspondência de Números
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Resultado Loteria Federal:</div>
                      <div className="text-2xl font-bold text-center text-gray-800">25.156</div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Últimos 5 dígitos:</div>
                      <div className="text-2xl font-bold text-center text-red-600">07.156</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-700 mb-4">
                    <strong>Transparência total:</strong> Utilizamos os últimos 5 dígitos do resultado 
                    oficial da Loteria Federal para determinar o ganhador.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Este sistema garante que o sorteio seja completamente auditável e impossível de manipular.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => window.open('/como-funciona', '_blank')}
                  >
                    Ver detalhes completos
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Transparência nos sorteios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
                <div className="text-sm text-gray-600">Taxa de manipulação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Disponibilidade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">Escalabilidade</div>
              </div>
            </div>
          </div>
        </section>

        {/* Examples Section */}
        <section className="py-16 px-4 border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Exemplos de Ganháveis
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {examples.map((example, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {example.title}
                    </h4>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-300 hover:border-blue-600 hover:text-blue-600"
                      onClick={() => window.open(example.url, '_blank')}
                    >
                      Ver Ganhável
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="py-16 px-4 border-b border-gray-100 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Benefícios de Parceria
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-red-100 to-blue-100 rounded-lg">
                        <benefit.icon className="h-6 w-6 text-gray-700" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Contato para Parcerias
            </h3>
            
            <Card className="max-w-2xl mx-auto border border-gray-200">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-2">
                      Felipe Ribeiro
                    </h4>
                    <p className="text-gray-600">Founder & CEO</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-medium text-gray-700">Email:</span>
                      <a 
                        href="mailto:suporte@ganhavel.com" 
                        className="text-blue-600 hover:text-blue-800"
                      >
                        suporte@ganhavel.com
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-medium text-gray-700">WhatsApp:</span>
                      <a 
                        href="https://wa.me/447747922946" 
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        +44 7747922946
                      </a>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <span className="font-medium text-gray-700">Instagram:</span>
                      <a 
                        href="https://www.instagram.com/ganhavel.premios/"
                        className="text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        @ganhavel.premios
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                Espaço reservado para logos de parceiros, gráficos de crescimento e menções na imprensa.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}