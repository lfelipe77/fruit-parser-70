import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { 
  Lightbulb, 
  Target, 
  Camera, 
  Users, 
  TrendingUp, 
  Shield, 
  Heart,
  Star,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Clock,
  MessageSquare,
  Share2,
  Gift,
  Trophy,
  Zap,
  Eye,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export default function GuiaDoCriador() {
  const guideSteps = [
    {
      step: 1,
      title: "Detalhes do Ganhavel",
      description: "Preencha a página do seu ganhavel com detalhes e o seu link de afiliado",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      step: 2,
      title: "Criação de Conteúdo",
      description: "Aproveite a oportunidade para melhorar o anúncio",
      icon: Camera,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      step: 3,
      title: "Definição de Preços",
      description: "Defina os preços dos bilhetes",
      icon: DollarSign,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      step: 4,
      title: "Lance e Compartilhe",
      description: "Lance e compartilhe nas redes sociais, quanto mais pessoas compartilharem... mais chances o sorteio do ganhavel poderá acontecer",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const bestPractices = [
    {
      title: "Fotos de Alta Qualidade",
      description: "Use imagens nítidas, bem iluminadas e de múltiplos ângulos",
      icon: Camera,
      tip: "Mínimo 5 fotos, resolução HD"
    },
    {
      title: "Descrição Detalhada",
      description: "Seja transparente sobre o produto, condições e entrega",
      icon: MessageSquare,
      tip: "Inclua especificações técnicas"
    },
    {
      title: "Preço Competitivo",
      description: "Pesquise o mercado e ofereça valor justo",
      icon: DollarSign,
      tip: "Considere custos de envio"
    },
    {
      title: "Engajamento Ativo",
      description: "Responda comentários e mantenha a audiência engajada",
      icon: Users,
      tip: "Tempo de resposta < 2 horas"
    }
  ];

  const successMetrics = [
    { label: "Taxa de Conversão", value: "85%", trend: "+12%" },
    { label: "Tempo Médio de Venda", value: "3.2 dias", trend: "-1.5 dias" },
    { label: "Satisfação do Cliente", value: "4.8/5", trend: "+0.3" },
    { label: "Taxa de Recompra", value: "67%", trend: "+8%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-orange-500/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-primary text-white border-0">
              <Lightbulb className="w-4 h-4 mr-2" />
              Guia Completo
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-600 to-orange-600 bg-clip-text text-transparent">
              Guia do Criador
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Aprenda a criar ganhaveis de sucesso e maximize suas vendas com estratégias comprovadas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/lance-seu-ganhavel">
                  <Gift className="w-5 h-5 mr-2" />
                  Criar Meu Ganhavel
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <PlayCircle className="w-5 h-5 mr-2" />
                Ver Vídeo Tutorial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {successMetrics.map((metric, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/20 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">{metric.value}</div>
                  <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
                  <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/20">
                    {metric.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              4 Passos Para o Sucesso
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Siga nosso método comprovado para criar ganhaveis que realmente vendem
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {guideSteps.map((step, index) => (
              <div key={step.step} className="flex items-start gap-6 mb-12 last:mb-0">
                <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <step.icon className={`w-8 h-8 ${step.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-bold">
                      Passo {step.step}
                    </Badge>
                    <h3 className="text-2xl font-bold">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">{step.description}</p>
                </div>
                {index < guideSteps.length - 1 && (
                  <div className="hidden md:block absolute left-8 mt-20">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-20 bg-gradient-to-br from-card/30 to-card/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Melhores Práticas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dicas essenciais dos criadores mais bem-sucedidos da plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {bestPractices.map((practice, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <practice.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{practice.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        <Star className="w-3 h-3 mr-1" />
                        {practice.tip}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Affiliate Marketing Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500 text-white border-0">
              <DollarSign className="w-4 h-4 mr-2" />
              Monetização
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              💸 Transforme Links em Lucro
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Você pode ganhar com cada bilhete vendido, sem estoque, sem dor de cabeça.
            </p>
          </div>

          {/* How it Works Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <Card className="text-center border-2 hover:border-emerald-500/20 transition-all hover:shadow-lg">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">✨ Escolha e Crie</h3>
                <p className="text-muted-foreground">
                  Basta escolher um produto, gerar seu link de afiliado, criar um Ganhavel e compartilhar!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-emerald-500/20 transition-all hover:shadow-lg">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">💰 Todo o Valor é Seu</h3>
                <p className="text-muted-foreground">
                  A Ganhavel não participa das transações financeiras — você lucra direto pelo seu link.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-emerald-500/20 transition-all hover:shadow-lg">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">🔥 Dica de Ouro</h3>
                <p className="text-muted-foreground">
                  Combine bons produtos + boas imagens + um bom título... E veja seu Ganhavel bombar nas redes!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Affiliate Programs */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
              🔥 TOP Programas de Afiliados
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Amazon Brasil */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-orange-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🛍️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Amazon Brasil</h4>
                      <p className="text-sm text-muted-foreground">Eletrônicos, livros, utensílios</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://associados.amazon.com.br" target="_blank" rel="noopener noreferrer">
                      → associados.amazon.com.br
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* AliExpress */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🌐</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">AliExpress</h4>
                      <p className="text-sm text-muted-foreground">Produtos virais, LEDs, gadgets</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://portals.aliexpress.com" target="_blank" rel="noopener noreferrer">
                      → portals.aliexpress.com
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Shopee */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🧨</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Shopee</h4>
                      <p className="text-sm text-muted-foreground">Beleza, casa criativa, acessórios</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://affiliate.shopee.com.br" target="_blank" rel="noopener noreferrer">
                      → affiliate.shopee.com.br
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Shein */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-pink-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">💅</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Shein</h4>
                      <p className="text-sm text-muted-foreground">Roupas, bolsas, maquiagem</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://affiliate.shein.com" target="_blank" rel="noopener noreferrer">
                      → affiliate.shein.com
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Magalu */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">💻</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Magalu Parceiro</h4>
                      <p className="text-sm text-muted-foreground">Celulares, games, eletros</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://parceiromagalu.com.br" target="_blank" rel="noopener noreferrer">
                      → parceiromagalu.com.br
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Booking */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-cyan-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">✈️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Booking.com</h4>
                      <p className="text-sm text-muted-foreground">Hospedagens e experiências</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://booking.com/affiliate-program" target="_blank" rel="noopener noreferrer">
                      → booking.com/affiliate-program
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* TikTok Shop */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">📱</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">TikTok Shop</h4>
                      <p className="text-sm text-muted-foreground">Produtos virais + vídeos</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://www.tiktok.com/business/pt" target="_blank" rel="noopener noreferrer">
                      → Pelo app TikTok ("Afiliados")
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Digital Products */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">📚</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Hotmart / Eduzz</h4>
                      <p className="text-sm text-muted-foreground">Cursos e e-books</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://hotmart.com" target="_blank" rel="noopener noreferrer">
                      → hotmart.com | eduzz.com
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Americanas */}
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-red-400/30">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🛒</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Americanas</h4>
                      <p className="text-sm text-muted-foreground">TVs, eletros, brinquedos</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm" asChild>
                    <a href="https://lomadee.com" target="_blank" rel="noopener noreferrer">
                      → lomadee.com
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Button variant="hero" size="lg" className="text-lg px-8">
              <Users className="w-5 h-5 mr-2" />
              👉 Como se cadastrar nos programas
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              <Gift className="w-5 h-5 mr-2" />
              📦 Ver produtos prontos para lançar
            </Button>
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-destructive">
              Erros Comuns a Evitar
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Aprenda com os erros mais frequentes e como evitá-los
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="font-bold mb-2">Fotos de Baixa Qualidade</h3>
                <p className="text-sm text-muted-foreground">
                  Imagens borradas ou mal iluminadas reduzem drasticamente as vendas
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="font-bold mb-2">Preços Inventados</h3>
                <p className="text-sm text-muted-foreground">
                  Evite preços inventados, diferentes do link de afiliado. Ganhaveis com preços irreais não serão aprovados
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <h3 className="font-bold mb-2">Falta de Interação</h3>
                <p className="text-sm text-muted-foreground">
                  Não responder comentários prejudica a confiança
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-br from-green-500/5 to-blue-500/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Casos de Sucesso
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de criadores que alcançaram resultados incríveis
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h3 className="font-bold">Maria S.</h3>
                    <p className="text-sm text-muted-foreground">iPhone 15 Pro</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Bilhetes vendidos:</span>
                    <span className="font-bold">2.500/2.500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo de venda:</span>
                    <span className="font-bold">18 horas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lucro:</span>
                    <span className="font-bold text-green-600">R$ 1.800</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Seguindo o guia, consegui vender todos os bilhetes em menos de 1 dia!"
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-bold">João P.</h3>
                    <p className="text-sm text-muted-foreground">PlayStation 5</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Bilhetes vendidos:</span>
                    <span className="font-bold">1.800/2.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo decorrido:</span>
                    <span className="font-bold">3 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Engajamento:</span>
                    <span className="font-bold text-blue-600">95%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "As dicas de engajamento fizeram toda a diferença nas vendas!"
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-8 h-8 text-purple-500" />
                  <div>
                    <h3 className="font-bold">Ana L.</h3>
                    <p className="text-sm text-muted-foreground">Kit Maquiagem</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Bilhetes vendidos:</span>
                    <span className="font-bold">500/500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa conversão:</span>
                    <span className="font-bold">92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Satisfação:</span>
                    <span className="font-bold text-purple-600">4.9/5</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "Fotos profissionais e descrição detalhada foram o segredo!"
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto Para Começar?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Aplique tudo que aprendeu e lance seu primeiro ganhavel de sucesso agora mesmo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" className="text-lg px-8" asChild>
              <Link to="/lance-seu-ganhavel">
                <Gift className="w-5 h-5 mr-2" />
                Criar Meu Ganhavel
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary">
              <Eye className="w-5 h-5 mr-2" />
              Ver Exemplos
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}