import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Target, TrendingUp, Users, Zap, Check, ArrowRight, Trophy, Ticket, Sparkles, Award, Shield, Phone, Mail, Instagram, Minus, User, Globe } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";
import ganhavelLogo from "@/assets/ganhavel-logo.png";

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
      
      <div className="min-h-screen bg-white relative overflow-hidden">
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 border-b border-gray-200">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-12">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <img 
                  src={ganhavelLogo} 
                  alt="Ganhavel Logo" 
                  className="w-24 h-24 drop-shadow-lg"
                />
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 relative">
                Ganhavel
                <Sparkles className="absolute -top-2 -right-10 h-8 w-8 text-yellow-500" />
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mb-8"></div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
              Kit de Mídia Oficial
            </h2>
            
            <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-6">
              Marketplace de Ganháveis – Transparente, Tecnológico e Inovador
            </h3>
            
            <p className="text-lg text-gray-900 max-w-3xl mx-auto flex items-center justify-center gap-2 font-medium">
              <Shield className="h-6 w-6 text-green-600" />
              O primeiro marketplace coletivo e gamificado de prêmios, auditável pela Loteria Federal.
            </p>
          </div>
        </section>

        {/* About Ganhavel */}
        <section className="relative py-20 px-4 border-b border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-12">
              <Award className="h-8 w-8 text-blue-600" />
              <h3 className="text-3xl font-bold text-gray-900 text-center">
                Sobre o Ganhavel
              </h3>
              <Award className="h-8 w-8 text-red-600" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-900 text-lg leading-relaxed">
                    <strong className="text-gray-900">Plataforma democratizada:</strong> Qualquer pessoa pode lançar um Ganhável com links de afiliados e parcerias estratégicas.
                  </p>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-900 text-lg leading-relaxed">
                    <strong className="text-gray-900">Transparência absoluta:</strong> Todos os sorteios são auditáveis e vinculados à Loteria Federal.
                  </p>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-900 text-lg leading-relaxed">
                    <strong className="text-gray-900">Segurança tecnológica:</strong> Plataforma robusta com sistemas de pagamento seguros e conformidade regulatória.
                  </p>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-900 text-lg leading-relaxed">
                    <strong className="text-gray-900">Modelo sustentável:</strong> O sorteio só acontece quando 100% do valor do Ganhável é arrecadado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gamificação & Oportunidades - Clean Minimal */}
        <section className="relative py-20 px-4 border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="p-3 bg-blue-50 rounded-full">
                <Zap className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900">
                Gamificação & Oportunidades
              </h3>
              <div className="p-3 bg-red-50 rounded-full">
                <Target className="h-7 w-7 text-red-600" />
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-8">
              <p className="text-xl text-gray-900 leading-relaxed">
                No Ganhavel, qualquer pessoa pode criar Ganháveis e lucrar através de afiliações e parcerias. 
                Nossa plataforma oferece um ambiente gamificado e viral que maximiza o engajamento.
              </p>
              
              <p className="text-xl text-gray-900 leading-relaxed">
                Marcas ganham visibilidade massiva e engajamento autêntico através de um ecossistema 
                inovador que transforma promoções tradicionais em experiências interativas e transparentes.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <p className="text-lg text-gray-900 font-medium">
                  💡 <strong>Versatilidade:</strong> Esse modelo pode ser utilizado também como uma vaquinha virtual para campanhas específicas.
                </p>
              </div>
            </div>
            
            {/* Clean benefits grid */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-gray-900 font-semibold text-sm">Engajamento</div>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-gray-900 font-semibold text-sm">Monetização</div>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Zap className="h-8 w-8 text-red-600 mx-auto mb-3" />
                <div className="text-gray-900 font-semibold text-sm">Crescimento</div>
              </div>
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <div className="text-gray-900 font-semibold text-sm">Resultados</div>
              </div>
            </div>
          </div>
        </section>

        {/* How Ganhavel Works - Visual Interface */}
        <section className="py-20 px-4 border-b border-gray-200 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Como Funciona o Ganhavel
              </h3>
              <p className="text-xl text-gray-800 max-w-2xl mx-auto">
                Interface real da plataforma - Sistema transparente e auditável
              </p>
            </div>
            
            {/* Real Ganhável Interface Mockup */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 mb-12">
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Left: Product & Details */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Product Image */}
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">Smart TV 43" AIWA</span>
                    </div>
                    
                    {/* Product Title */}
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Smart TV 43" AIWA da Americanas</h4>
                    
                    {/* Pricing Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Meta:</span>
                        <span className="font-semibold text-gray-900">R$ 1.699,00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Preço por bilhete:</span>
                        <span className="font-semibold text-gray-900">R$ 2,00</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Número de participantes:</span>
                        <span className="font-semibold text-gray-900">327 pessoas</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Última compra há:</span>
                        <span className="font-semibold text-gray-900">2 min</span>
                      </div>
                    </div>
                    
                    {/* Arrow & Label */}
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center">
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-l-lg text-sm font-medium">
                        Produto & Detalhes
                      </div>
                      <ArrowRight className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                {/* Center: Progress & Actions */}
                <div className="lg:col-span-2 relative">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Progress Section */}
                    <div className="mb-6">
                      <h5 className="font-semibold text-gray-900 mb-2">Progresso da Campanha</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Arrecadado:</span>
                          <span className="font-semibold text-green-600">R$ 1.359,00</span>
                        </div>
                        <ProgressBar value={80} showLabel={false} className="mb-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1359 vendido de 1699</span>
                          <span>80% concluído</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Purchase Section */}
                    <div className="border-t border-gray-100 pt-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Comprar Bilhetes</h5>
                      <div className="flex gap-2 mb-3">
                        <input 
                          type="number" 
                          defaultValue="2" 
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center"
                          disabled
                        />
                        <div className="flex-1 bg-green-600 text-white rounded-md px-4 py-2 text-center font-medium">
                          Comprar 2 bilhetes
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 text-center">
                        Total a pagar: <strong>R$ 4,00</strong>
                      </div>
                    </div>
                    
                    {/* Arrow & Label */}
                    <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center">
                      <div className="bg-green-600 text-white px-3 py-1 rounded-l-lg text-sm font-medium">
                        Participação
                      </div>
                      <ArrowRight className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>
                
                {/* Right: Tickets */}
                <div className="lg:col-span-1 relative">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h5 className="font-semibold text-gray-900 mb-3">Seus Números</h5>
                    
                    {/* Sample Ticket Numbers - 5 pairs format */}
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs text-green-600 mb-1">Bilhete #1</div>
                        <div className="font-mono font-bold text-green-800 text-sm">
                          23-44-51-53-65
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="text-xs text-green-600 mb-1">Bilhete #2</div>
                        <div className="font-mono font-bold text-green-800 text-sm">
                          12-38-47-62-89
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center mt-2">
                        💡 Números gerados aleatoriamente
                      </div>
                    </div>
                    
                    {/* Arrow & Label */}
                    <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 lg:hidden flex flex-col items-center">
                      <ArrowRight className="h-6 w-6 text-red-600 rotate-90" />
                      <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium mt-2">
                        Seus Bilhetes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Completion & Draw Result */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8 mb-8 border border-red-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Ganhável Finalizado - 100% Atingido!</h4>
                <p className="text-gray-900">O sorteio acontece automaticamente quando a meta é atingida</p>
              </div>
              
              {/* Final Progress */}
              <div className="max-w-md mx-auto mb-6">
                <ProgressBar value={100} showLabel={false} className="mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>850/850 bilhetes vendidos</span>
                  <span>R$ 1.699,00 arrecadados</span>
                </div>
              </div>
              
              {/* Draw Result */}
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto text-center">
                <h5 className="font-semibold text-gray-900 mb-3">Resultado do Sorteio</h5>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Loteria Federal (último sorteio):</div>
                    <div className="text-2xl font-bold text-gray-800 font-mono">23-44-51-53-65</div>
                  </div>
                  
                  <ArrowRight className="h-6 w-6 text-gray-400 mx-auto" />
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Número ganhador:</div>
                    <div className="bg-red-100 border-2 border-red-300 rounded-lg p-3">
                      <div className="text-xl font-bold text-red-600 font-mono">23-44-51-53-65</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-semibold text-green-800">🎉 Bilhete #1 é o ganhador!</div>
                </div>
              </div>
            </div>
            
            {/* How Numbers Match - Simplified */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">
                Sistema de Correspondência Transparente
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-gray-900 mb-4">
                    <strong>100% Auditável:</strong> Utilizamos os resultados oficiais da Loteria Federal 
                    para determinar o ganhador de cada Ganhável.
                  </p>
                  <p className="text-gray-900 mb-4">
                    Cada bilhete possui números únicos de 5 pares que são comparados com o resultado oficial, 
                    garantindo total transparência e impossibilidade de manipulação.
                  </p>
                  <p className="text-gray-900 mb-4">
                    <strong>Modelo versátil:</strong> Esse modelo pode ser utilizado também como uma 
                    "vaquinha virtual" para campanhas específicas.
                  </p>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    onClick={() => window.open('/como-funciona', '_blank')}
                  >
                    Ver Como Funciona - Detalhes Completos
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Key Statistics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-sm text-gray-800">Transparência nos sorteios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
                <div className="text-sm text-gray-800">Taxa de manipulação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">24/7</div>
                <div className="text-sm text-gray-800">Disponibilidade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm text-gray-800">Escalabilidade</div>
              </div>
            </div>
          </div>
        </section>

        {/* Sobre o Fundador */}
        <section className="py-20 px-4 border-b border-gray-200 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="p-3 bg-blue-50 rounded-full">
                <User className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 text-center">
                Sobre o Fundador
              </h3>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl text-gray-900 leading-relaxed">
                Felipe Ribeiro – Profissional de automação com experiência internacional, idealizou há anos um marketplace de sorteios justo e transparente. 
                Após planejamento e dedicação, concluiu o MVP da Ganhavel, desenvolvido com atenção máxima à qualidade, segurança e funcionalidade.
              </p>
            </div>
          </div>
        </section>

        {/* Objetivo Estratégico */}
        <section className="py-20 px-4 border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="p-3 bg-green-50 rounded-full">
                <Globe className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 text-center">
                Objetivo Estratégico
              </h3>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-xl text-gray-900 leading-relaxed">
                A Ganhavel nasce como uma solução inovadora e coletiva, mas com visão global de expansão. 
                Estamos abertos a parcerias estratégicas para crescimento conjunto, assim como oportunidades de incorporação ou fusão com grandes players que compartilhem os mesmos valores de transparência, tecnologia e impacto coletivo.
              </p>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}