import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { ComoFuncionaSEO } from "@/components/SEOPages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Users, Gift, Shield, Clock, Trophy, Building2, Mail, Eye, Heart, AlertTriangle, Bot, Package, CreditCard, DollarSign, ExternalLink, Globe } from "lucide-react";
import { Link } from "react-router-dom";

export default function ComoFunciona() {
  const participateSteps = [
    {
      number: "01",
      title: "Escolha seu Ganhavel",
      description: "Navegue por ganhaveis reais ou lance seu próprio ganhavel. Bilhetes por apenas R$5 com pagamento seguro!",
      icon: Gift,
      color: "from-blue-500 to-cyan-500"
    },
    {
      number: "02", 
      title: "Compre seus Bilhetes",
      description: "Acompanhe a arrecadação em tempo real. Quanto mais bilhetes, maiores suas chances de ganhar!",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
    {
      number: "03",
      title: "100% Arrecadado = Próximo Sorteio",
      description: "Uma vez que o valor completo for arrecadado, o próximo sorteio da Caixa definirá o ganhador do site!",
      icon: Clock,
      color: "from-orange-500 to-red-500"
    },
    {
      number: "04",
      title: "Resultado Oficial",
      description: "Baseado na Loteria Federal do País de Origem do Produto. Sorteio público, imparcial e 100% rastreável!",
      icon: Trophy,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const launchSteps = [
    {
      number: "01",
      title: "Qualquer um pode lançar",
      description: "Qualquer pessoa pode lançar um ganhavel na plataforma - não há restrições especiais",
      icon: Users,
      color: "from-emerald-500 to-teal-500"
    },
    {
      number: "02", 
      title: "Dinheiro retido em instituição financeira",
      description: "O valor arrecadado fica seguro em instituição financeira parceira durante todo o processo",
      icon: Shield,
      color: "from-violet-500 to-purple-500"
    },
    {
      number: "03",
      title: "Sorteio baseado na Loteria Federal",
      description: "Resultado determinado pela Loteria Federal quando 100% do valor for arrecadado",
      icon: Trophy,
      color: "from-pink-500 to-rose-500"
    },
    {
      number: "04",
      title: "Entrega automática ou manual",
      description: "Produtos afiliados: compra automática. Produtos físicos: protocolo de confirmação de entrega",
      icon: Package,
      color: "from-amber-500 to-orange-500"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Sorteios baseados na Loteria Federal do País de Origem do Produto - não operamos sorteios próprios"
    },
    {
      icon: Eye,
      title: "Transparência Total",
      description: "Os valores arrecadados são exatos, sem ganhos extras, justo e com resultados baseados em sorteios públicos oficiais"
    },
    {
      icon: Heart,
      title: "Qualquer Pessoa Pode Participar",
      description: "Participe de ganhaveis existentes ou lance seu próprio ganhavel na plataforma facilmente"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ComoFuncionaSEO />
      <Navigation />
      
      {/* Disclaimer Section */}
      <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Atenção:</strong> A Ganhavel apenas conecta participantes com organizadores. Não operamos ganhaveis diretamente nem movimentamos os valores dos bilhetes.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6">
              Simples, Seguro e 100% Transparente
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Como Funciona a Ganhavel?
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Participe de ganhaveis ou lance seu próprio ganhavel de forma prática, legal e rastreável. 
              Baseado em confiança, transparência total e sorteios oficiais da Loteria Federal.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/descobrir">
                Começar Agora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content with Tabs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="participate" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-16">
              <TabsTrigger value="participate">Como Participar</TabsTrigger>
              <TabsTrigger value="launch">Lançar Ganhavel</TabsTrigger>
              <TabsTrigger value="companies">Empresas</TabsTrigger>
            </TabsList>
            
            {/* Participate Tab */}
            <TabsContent value="participate" className="space-y-16">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  🎟️ Como Participar de um Ganhavel
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Participar é fácil, barato e 100% seguro
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {participateSteps.map((step, index) => (
                  <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color}`}></div>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-muted-foreground mb-2">{step.number}</div>
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-8">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <Mail className="w-8 h-8 text-primary" />
                      Importante sobre o Sorteio
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>O sorteio NÃO tem data fixa - acontece quando 100% do valor for arrecadado</span>
                      </li>
                       <li className="flex items-start gap-3">
                         <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                         <span>Você recebe email automático assim que o valor for atingido - com a data do próximo sorteio da Caixa</span>
                       </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Compartilhe seus ganhaveis participantes - quanto mais pessoas, mais rápido o sorteio!</span>
                      </li>
                    </ul>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Resultado baseado na Loteria Federal do País de Origem
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Launch Tab */}
            <TabsContent value="launch" className="space-y-16">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  🚀 Como Lançar seu Próprio Ganhavel
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Qualquer pessoa pode lançar ganhaveis na plataforma. O dinheiro fica seguro em instituição financeira durante todo o processo.
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {launchSteps.map((step, index) => (
                  <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${step.color}`}></div>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-muted-foreground mb-2">{step.number}</div>
                      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Detalhes Importantes</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h4 className="font-semibold mb-2">Segurança Financeira</h4>
                      <p className="text-sm text-muted-foreground">
                        Dinheiro retido em instituição financeira durante todo o processo para máxima segurança
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ExternalLink className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                      <h4 className="font-semibold mb-2">Produtos Afiliados</h4>
                      <p className="text-sm text-muted-foreground">
                        Compra é efetivada automaticamente usando links de afiliado após o sorteio
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Package className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                      <h4 className="font-semibold mb-2">Produtos Físicos</h4>
                      <p className="text-sm text-muted-foreground">
                        Seguem protocolos rigorosos de confirmação da entrega ao ganhador
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Companies Tab */}
            <TabsContent value="companies" className="space-y-16">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  🏢 Empresas com CNPJ
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Contrato formal e legalidade para organizações
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <Card className="overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                          <Building2 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Soluções Empresariais</h3>
                        <ul className="space-y-3 text-muted-foreground">
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Contrato oficial em nome do seu CNPJ</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Garantia de legalidade e rastreabilidade jurídica</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Ideal para ações promocionais e marketing</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Perfeito para campanhas beneficentes</span>
                          </li>
                        </ul>
                      </div>
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-8">
                          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
                          <h4 className="text-xl font-semibold mb-4">Conformidade Legal</h4>
                          <p className="text-muted-foreground">
                            Estamos comprometidos com a conformidade legal em todos os níveis
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Quem Pode Lançar Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ❓ Quem Pode Lançar um Ganhavel?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Qualquer pessoa pode lançar seu próprio ganhavel na plataforma
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Produtos Afiliados */}
            <Card className="p-8">
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Qualquer pessoa pode lançar seu próprio ganhavel</h3>
                    <p className="text-muted-foreground">Inclusive para produtos afiliados - basta inserir o link de afiliado de vendedores validados (Amazon, Mercado Livre, Casas Bahia etc).</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Package className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Produtos afiliados - Compra automática</h3>
                    <p className="text-muted-foreground">Para produtos com links de afiliado, a compra é efetivada automaticamente após o sorteio. O comprovante é enviado para o ganhador e organizador.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produtos Próprios */}
            <Card className="p-8 border-2 border-green-500/20">
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-400">Produtos Próprios</h3>
                    <p className="text-muted-foreground">Qualquer pessoa pode vender seus bens, desde que comprove a entrega ao ganhador para validar a liberação do valor perante a Monew.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Processo de Validação</h3>
                    <p className="text-muted-foreground">O valor arrecadado fica retido até a comprovação da entrega do produto ao ganhador, garantindo segurança para todos os participantes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Produtos Não Afiliados */}
            <Card className="p-8 border-2 border-primary/20">
              <CardContent className="space-y-6">
                <div className="text-center mb-6">
                  <Badge variant="secondary" className="mb-2">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Produtos Não Afiliados
                  </Badge>
                  <h3 className="text-xl font-semibold">Imóveis, Automóveis e Produtos Diretos</h3>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Comprovação de Entrega Obrigatória</h4>
                    <p className="text-muted-foreground">Para produtos não afiliados (imóveis, automóveis, etc.), é de extrema importância que a entrega seja comprovada mediante ao ganhador, para que em seguida o valor seja liberado ao vendedor.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Processo de Liberação de Fundos</h4>
                    <p className="text-muted-foreground">É possível completarmos a transação no momento da transferência do bem ou produto, ou mediante comprovação de recebimento de veículos de entregas confiáveis.</p>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <Package className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Responsabilidade do Vendedor</h4>
                      <p className="text-muted-foreground">O vendedor deverá arcar com o envio até o recebimento final e mediante prova confirmada, o fundo será transferido para o vendedor.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Prêmios e Entregas Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              📦 Sobre Prêmios, Entregas e Garantias
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="p-8">
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cancelamento automático após 30 dias</h3>
                    <p className="text-muted-foreground">Todo ganhavel que ficar 30 dias sem novos recebimentos será automaticamente cancelado. Todos os participantes poderão transferir seus créditos para qualquer outro ganhaveis não sorteados na plataforma.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Garantia de entrega em 7 dias</h3>
                    <p className="text-muted-foreground">Se o prêmio não for comprovado como entregue até 7 dias após o sorteio, o ganhador poderá escolher outro produto do mesmo valor dentro da plataforma. A Ganhavel fará a compra diretamente para garantir a entrega.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Comprovação de entrega</h3>
                    <p className="text-muted-foreground">A entrega deve ser comprovada por:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>✔️ Nota fiscal</li>
                      <li>✔️ Print do pedido + e-mail de confirmação</li>
                      <li>✔️ Ou confirmação direta do ganhador por e-mail</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Destaque visual sobre plataforma */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-yellow-800 dark:text-yellow-200">⚠️ Importante</h3>
                  <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                    A plataforma apenas conecta participantes com organizadores. Não operamos ganhaveis diretamente nem movimentamos os valores dos bilhetes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tecnologia e Segurança Inteligente Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🔐 Tecnologia e Segurança Inteligente
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Utilizamos tecnologia de Inteligência Artificial para gerenciar pagamentos, compras e segurança
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <CardContent className="space-y-8">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Bot className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">A IA acompanha automaticamente:</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Status do ganhavel</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Entrega dos prêmios</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Confirmação da entrega antes da liberação dos valores</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Agilidade, rastreabilidade e redução de fraudes em todo o processo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🔐 Segurança, Legalidade e Transparência
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nossa plataforma foi construída com base em confiança e transparência total
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardContent className="p-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-2xl p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-6">Como Garantimos a Segurança</h3>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">A plataforma não movimenta dinheiro diretamente</span>
                  </div>
                   <div className="flex items-start gap-3">
                     <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                     <span className="text-muted-foreground">Primeira fase: anunciantes aprovados retêm valores diretamente</span>
                   </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Sorteio baseado na Loteria Federal do País de Origem</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Notificações automáticas por e-mail</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Monew Partnership Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500/5 to-green-500/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Parceiro Oficial
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pagamentos 100% Seguros
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
                Contamos com parceiro financeiro licenciado que faz a custódia dos valores arrecadados, 
                libera os pagamentos somente após a entrega dos prêmios e garante segurança total via PIX.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="border-2 border-green-500/20 bg-green-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                    Custódia Segura
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Valores ficam sob custódia de parceiro financeiro licenciado até a entrega
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20 bg-blue-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">
                    Liberação Controlada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Pagamentos só após comprovação da entrega
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-500/20 bg-purple-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">
                    Segurança Total via PIX
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Transações protegidas e rastreáveis
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-500/20 bg-orange-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">
                    Fintech Licenciada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Regulamentada e confiável
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center text-white">
              <Building2 className="w-16 h-16 mx-auto mb-6 text-blue-300" />
              <h3 className="text-2xl font-bold mb-4">
                Transparência e Segurança Garantidas
              </h3>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Com parceiro financeiro licenciado, todos os valores ficam protegidos e só são liberados quando o ganhador receber seu prêmio.
                A Ganhavel não manipula dinheiro diretamente, garantindo total transparência.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-blue-50"
                  asChild
                >
                  <Link to="/confianca-seguranca">
                    <Eye className="w-4 h-4 mr-2" />
                    Saiba mais sobre nossa segurança
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lottery Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🎲 Como Funciona o Sorteio?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Utilizamos os números sorteados oficialmente pela <strong>Loteria Federal da Caixa Econômica Federal</strong>, 
              um sorteio público, auditado e 100% rastreável.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Cada número vendido no Ganhavel é composto por 6 pares de dígitos <br />
              <span className="font-mono bg-muted px-3 py-1 rounded-md text-foreground">(ex: 24-33-47-55-57-60)</span>
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Process Flow */}
            <Card className="p-8">
              <CardContent className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                    🔢 No dia do sorteio:
                  </h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      1
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        O sistema compara o número formado pelos dígitos sorteados pela Caixa com os números vendidos.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      2
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Se houver um número idêntico, ele é o ganhador.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      3
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Se ninguém tiver o número exato, o sistema escolhe automaticamente o número mais próximo em ordem crescente, 
                        desde que ainda não tenha sido premiado.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Tie Breaker */}
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                        ⚠️ Em caso de empate de proximidade:
                      </h4>
                      <p className="text-orange-700 dark:text-orange-300">
                        O sistema verifica quem comprou primeiro e define o vencedor com base na ordem de compra.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <Card className="p-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-6">🛡️ Esse processo garante:</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Transparência</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Rastreabilidade</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Nenhum número repetido</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Prêmio sempre entregue de forma justa</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visual Diagram */}
            <Card className="p-8">
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-8">📊 Fluxo Visual do Processo</h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      1️⃣
                    </div>
                    <h4 className="font-semibold mb-2">Valor 100% Arrecadado</h4>
                    <p className="text-sm text-muted-foreground">Meta do ganhavel atingida</p>
                  </div>
                  
                  <div className="hidden md:block text-2xl text-muted-foreground">→</div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      2️⃣
                    </div>
                    <h4 className="font-semibold mb-2">Sorteio da Caixa</h4>
                    <p className="text-sm text-muted-foreground">Loteria Federal oficial</p>
                  </div>
                  
                  <div className="hidden md:block text-2xl text-muted-foreground">→</div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      3️⃣
                    </div>
                    <h4 className="font-semibold mb-2">Comparação automática</h4>
                    <p className="text-sm text-muted-foreground">Sistema verifica números</p>
                  </div>
                  
                  <div className="hidden md:block text-2xl text-muted-foreground">→</div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      4️⃣
                    </div>
                    <h4 className="font-semibold mb-2">Ganhador definido</h4>
                    <p className="text-sm text-muted-foreground">Resultado transparente</p>
                  </div>
                  
                  <div className="hidden md:block text-2xl text-muted-foreground">→</div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3">
                      5️⃣
                    </div>
                    <h4 className="font-semibold mb-2">Verificação de entrega</h4>
                    <p className="text-sm text-muted-foreground">Prêmio confirmado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ❓ Perguntas Frequentes
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Como sei que o sorteio é justo?</h3>
                <p className="text-muted-foreground">
                  Utilizamos os resultados oficiais da Loteria Federal do País de Origem do Produto. 
                  O sorteio é público, imparcial e 100% rastreável - não operamos sorteios próprios.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Quando acontece o sorteio?</h3>
                <p className="text-muted-foreground">
                  O sorteio NÃO tem data fixa. Ele acontece somente quando 100% do valor do ganhavel for arrecadado. 
                  Você receberá um e-mail automático informando o resultado baseado na Loteria Federal do País de Origem.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Como funcionam os valores?</h3>
                <p className="text-muted-foreground">
                  Os valores são pagos diretamente para nosso parceiro financeiro seguro 
                  <a href="https://monew.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mx-1">
                    Monew
                  </a>
                  - uma fintech licenciada que retém o valor em segurança e autoriza a compra final do prêmio quando o ganhador for definido. 
                  A Ganhavel não movimenta dinheiro diretamente, garantindo total transparência e segurança nas transações.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">O que acontece se o ganhavel não vender?</h3>
                <p className="text-muted-foreground">
                  Todo ganhavel que ficar 30 dias sem novos recebimentos será automaticamente cancelado. 
                  Todos os participantes receberão o valor pago de volta, descontando apenas eventuais taxas da plataforma.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">E se o prêmio não for entregue?</h3>
                <p className="text-muted-foreground">
                  Se o prêmio não for comprovado como entregue até 7 dias após o sorteio, o ganhador poderá escolher outro produto do mesmo valor. 
                  A plataforma em parceria com a Monew sempre fará a compra diretamente para garantir que o ganhador receba seu prêmio, 
                  independentemente de qualquer problema com o organizador original.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Como a entrega do prêmio é confirmada?</h3>
                <p className="text-muted-foreground">
                  A entrega pode ser comprovada por nota fiscal, comprovante do pedido ou confirmação por e-mail do ganhador. 
                  Só após isso o valor é liberado ao organizador.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">A plataforma movimenta o dinheiro do ganhavel?</h3>
                <p className="text-muted-foreground">
                  Não. Os valores ficam sob custódia de parceiros de pagamento (como Monew). 
                  Só são liberados após a confirmação da entrega do prêmio, trazendo mais segurança para todos.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">A plataforma usa inteligência artificial?</h3>
                <p className="text-muted-foreground">
                  Sim. Utilizamos IA para automatizar processos de validação, status de ganhaveis, confirmação de prêmios e liberação de valores. 
                  Isso reduz fraudes e agiliza o funcionamento.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Posso lançar meu próprio ganhavel?</h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Sim, todos podem lançar seus ganhaveis!</strong> Você pode criar ganhaveis com links afiliados, produtos físicos, 
                  bens pessoais (carro, apartamento), gift cards, ou qualquer item de valor.
                </p>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Links Afiliados:</strong> Lançadores podem usar seus próprios links de afiliado - as comissões são pagas diretamente pelas empresas parceiras (Amazon, Mercado Livre, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Produtos Próprios:</strong> Qualquer pessoa pode vender seus bens, desde que comprove a entrega ao ganhador</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span><strong>Sistema de Confiança:</strong> Mantemos um ranking de boas condutas para garantir a qualidade da plataforma</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para Participar?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Explore nossos ganhaveis ativos ou lance seu próprio ganhavel hoje mesmo!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/descobrir">
                  Ver Ganhaveis Ativos
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/signup">
                  Criar Conta e Lançar Ganhavel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Extra */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm">
                💳 Pagamentos com segurança por Monew – Fintech Parceira Oficial da Ganhavel
              </span>
            </div>
            
            <Button variant="outline" size="sm" asChild className="text-muted-foreground">
              <Link to="/termos">
                📜 Consulte nossos Termos de Uso para regras completas sobre prazos, devoluções, segurança e funcionamento da plataforma
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}