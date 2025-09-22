import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Target, TrendingUp, Users, Zap } from "lucide-react";

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