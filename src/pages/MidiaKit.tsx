import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Target, TrendingUp, Users, Zap, Check, ArrowRight, Trophy, Ticket, Sparkles, Award, Shield } from "lucide-react";
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
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-white to-blue-50/30"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-red-100/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
        
        {/* Hero Section */}
        <section className="relative py-16 px-4 border-b border-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <img 
                  src={ganhavelLogo} 
                  alt="Ganhavel Logo" 
                  className="w-20 h-20 drop-shadow-lg"
                />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative">
                Ganhavel
                <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-500" />
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mb-6"></div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Marketplace de Ganháveis – Transparente, Tecnológico e Inovador
            </h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto flex items-center justify-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              O primeiro marketplace coletivo e gamificado de prêmios, auditável pela Loteria Federal.
            </p>
          </div>
        </section>

        {/* About Ganhavel */}
        <section className="relative py-16 px-4 border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Award className="h-8 w-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900 text-center">
                Sobre o Ganhavel
              </h3>
              <Award className="h-8 w-8 text-red-600" />
            </div>
            
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

        {/* Gamificação & Oportunidades - Gaming Style */}
        <section className="relative py-20 px-4 border-b border-gray-100 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-green-900"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          
          {/* Floating Game Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Flying Tickets */}
            <div className="absolute top-10 left-10 animate-bounce">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-lg shadow-lg text-black font-bold text-xs rotate-12">
                🎫 BILHETE #001
              </div>
            </div>
            <div className="absolute top-20 right-20 animate-pulse">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-lg shadow-lg text-white font-bold text-xs -rotate-12">
                🎫 BILHETE #247
              </div>
            </div>
            <div className="absolute bottom-20 left-20 animate-bounce delay-300">
              <div className="bg-gradient-to-r from-pink-400 to-red-500 p-2 rounded-lg shadow-lg text-white font-bold text-xs rotate-45">
                🎫 BILHETE #589
              </div>
            </div>
            
            {/* Spinning Money */}
            <div className="absolute top-32 right-10 animate-spin">
              <div className="text-4xl">💰</div>
            </div>
            <div className="absolute bottom-32 right-32 animate-spin delay-500">
              <div className="text-3xl">💎</div>
            </div>
            <div className="absolute top-1/2 left-10 animate-spin delay-1000">
              <div className="text-2xl">🪙</div>
            </div>
            
            {/* Dream Elements */}
            <div className="absolute top-16 left-1/3 animate-pulse">
              <div className="text-2xl">🏠</div>
            </div>
            <div className="absolute bottom-16 right-1/3 animate-pulse delay-700">
              <div className="text-2xl">🚗</div>
            </div>
            <div className="absolute top-1/3 right-16 animate-pulse delay-1000">
              <div className="text-2xl">📱</div>
            </div>
            
            {/* Sparkle Effects */}
            <div className="absolute top-10 left-1/2 animate-ping">
              <div className="text-yellow-400">✨</div>
            </div>
            <div className="absolute bottom-10 left-1/4 animate-ping delay-500">
              <div className="text-yellow-400">⭐</div>
            </div>
            <div className="absolute top-1/2 right-1/4 animate-ping delay-1000">
              <div className="text-yellow-400">🌟</div>
            </div>
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center z-10">
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="text-4xl animate-bounce">🎮</div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Gamificação & Oportunidades
                </h3>
                <div className="text-4xl animate-bounce delay-300">🎯</div>
              </div>
              
              {/* Game-style subtitle */}
              <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-lg">
                🚀 LEVEL UP YOUR DREAMS! 🚀
              </div>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">
                <p className="text-xl text-white leading-relaxed">
                  <span className="text-yellow-400 font-bold">🎲 No Ganhavel</span>, qualquer pessoa pode criar Ganháveis e 
                  <span className="text-green-400 font-bold"> lucrar através de afiliações e parcerias</span>. 
                  Nossa plataforma oferece um <span className="text-pink-400 font-bold">ambiente gamificado e viral</span> que maximiza o engajamento.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-2xl">
                <p className="text-xl text-white leading-relaxed">
                  <span className="text-blue-400 font-bold">🏆 Marcas ganham</span> visibilidade massiva e engajamento autêntico através de um 
                  <span className="text-yellow-400 font-bold">ecossistema inovador</span> que transforma promoções tradicionais em 
                  <span className="text-green-400 font-bold">experiências interativas e transparentes</span>.
                </p>
              </div>
            </div>
            
            {/* Game Stats Display */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-b from-yellow-400 to-orange-500 rounded-lg p-4 text-black shadow-lg">
                <div className="text-2xl font-bold">∞</div>
                <div className="text-sm font-medium">SONHOS</div>
              </div>
              <div className="bg-gradient-to-b from-green-400 to-emerald-500 rounded-lg p-4 text-black shadow-lg">
                <div className="text-2xl font-bold">💯</div>
                <div className="text-sm font-medium">CHANCES</div>
              </div>
              <div className="bg-gradient-to-b from-blue-400 to-cyan-500 rounded-lg p-4 text-black shadow-lg">
                <div className="text-2xl font-bold">🎮</div>
                <div className="text-sm font-medium">DIVERSÃO</div>
              </div>
              <div className="bg-gradient-to-b from-pink-400 to-rose-500 rounded-lg p-4 text-black shadow-lg">
                <div className="text-2xl font-bold">🏆</div>
                <div className="text-sm font-medium">VITÓRIAS</div>
              </div>
            </div>
          </div>
        </section>

        {/* How Ganhavel Works - Visual Interface */}
        <section className="py-20 px-4 border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Como Funciona o Ganhavel
            </h3>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Interface real da plataforma - Sistema transparente e auditável
            </p>
            
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
                        <span className="text-gray-600">Participantes:</span>
                        <span className="font-semibold text-gray-900">327 pessoas</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Última compra:</span>
                        <span className="font-semibold text-gray-900">há 2 min</span>
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
                          <span>680/850 bilhetes</span>
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
                <p className="text-gray-700">O sorteio acontece automaticamente quando a meta é atingida</p>
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
                  <p className="text-gray-700 mb-4">
                    <strong>100% Auditável:</strong> Utilizamos os resultados oficiais da Loteria Federal 
                    para determinar o ganhador de cada Ganhável.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Cada bilhete possui números únicos de 5 pares que são comparados com o resultado oficial, 
                    garantindo total transparência e impossibilidade de manipulação.
                  </p>
                  <p className="text-gray-700 mb-4">
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
        <section className="relative py-16 px-4 border-b border-gray-100 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Zap className="h-8 w-8 text-yellow-500" />
              <h3 className="text-2xl font-bold text-gray-900 text-center">
                Benefícios de Parceria
              </h3>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
            
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
        <section className="relative py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Users className="h-8 w-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                Contato para Parcerias
              </h3>
              <Users className="h-8 w-8 text-red-600" />
            </div>
            
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
            
            <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-2 right-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Espaço Futuro</span>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
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