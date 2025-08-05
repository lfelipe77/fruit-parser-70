import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { 
  Users, 
  Code, 
  Megaphone, 
  Palette, 
  PenTool,
  Video,
  Building2,
  TrendingUp,
  Zap,
  DollarSign,
  Mail,
  Target,
  Heart,
  CheckCircle,
  Rocket,
  Globe,
  BookOpen
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TrabalheConosco() {
  const professionalsCategories = [
    {
      icon: Code,
      title: "Desenvolvedores",
      description: "Front-End, Back-End, Fullstack",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Megaphone,
      title: "Marketing de Afiliados",
      description: "Especialistas em afiliação e performance",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Users,
      title: "Gestores de Comunidade",
      description: "Community managers e social media",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Palette,
      title: "Designers",
      description: "UI/UX Designers e Videomakers",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: PenTool,
      title: "Copywriters",
      description: "Redatores criativos e estratégicos",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  const creatorsCategories = [
    {
      icon: Video,
      title: "Influenciadores Digitais",
      description: "Youtubers, TikTokers, Instagramers"
    },
    {
      icon: BookOpen,
      title: "Educadores Digitais",
      description: "Empreendedores que querem ensinar e ganhar"
    }
  ];

  const businessCategories = [
    {
      icon: TrendingUp,
      title: "Agências de Marketing",
      description: "Marketing e tráfego pago"
    },
    {
      icon: Building2,
      title: "Marketplaces",
      description: "Plataformas com APIs abertas"
    },
    {
      icon: Zap,
      title: "Ferramentas SaaS",
      description: "Soluções que podem ser integradas"
    },
    {
      icon: DollarSign,
      title: "Soluções Financeiras",
      description: "Gateways de pagamento e compliance"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-primary text-white border-0">
              <Heart className="w-4 h-4 mr-2" />
              Junte-se ao Time
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Trabalhe Conosco
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Seja parte do Ganhavel - um movimento para legalizar, democratizar e transformar o universo de prêmios, sorteios e afiliados.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-8">
                <div className="text-center mb-8">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Nossa Missão</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6 text-center">
                  O Ganhavel é mais do que uma plataforma. É um movimento para legalizar, democratizar e transformar o universo de prêmios, sorteios e afiliados.
                </p>
                <p className="text-lg text-center font-medium">
                  Se você acredita que rifas falsas precisam acabar, e que qualquer pessoa merece ter acesso a prêmios reais e oportunidades de renda, essa missão também é sua.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professionals Section */}
      <section className="py-20 bg-gradient-to-br from-card/30 to-card/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              🤝 Buscamos Parcerias
            </h2>
          </div>

          {/* Profissionais */}
          <div className="max-w-6xl mx-auto mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">1. Profissionais</h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
              {professionalsCategories.map((category, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                  <CardContent className="pt-6 text-center">
                    <div className={`w-16 h-16 rounded-full ${category.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                      <category.icon className={`w-8 h-8 ${category.color}`} />
                    </div>
                    <h4 className="font-bold text-sm mb-2">{category.title}</h4>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Criadores de Conteúdo */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">2. Criadores de Conteúdo</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {creatorsCategories.map((category, index) => (
                <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-lg">{category.title}</h4>
                    </div>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Empresas & Plataformas */}
          <div className="max-w-4xl mx-auto mb-16">
            <h3 className="text-2xl font-bold mb-8 text-center">3. Empresas & Plataformas</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {businessCategories.map((category, index) => (
                <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-lg">{category.title}</h4>
                    </div>
                    <p className="text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Investidores */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-8 text-center">4. Investidores</h3>
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Pessoas físicas ou fundos que acreditam em novos modelos de economia digital</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Parceiros estratégicos para escalar com tecnologia, mídia e presença internacional</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Future Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-8">
                <div className="text-center mb-8">
                  <Rocket className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold mb-4">🚀 Em breve: Cursos, Ferramentas e Acesso Exclusivo</h2>
                </div>
                <p className="text-lg text-muted-foreground mb-6 text-center">
                  Estamos desenvolvendo produtos e cursos oficiais do Ganhavel, para ensinar:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                    <h4 className="font-semibold mb-2">Como lançar e divulgar</h4>
                    <p className="text-sm text-muted-foreground">prêmios ganhaveis</p>
                  </div>
                  <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                    <h4 className="font-semibold mb-2">Como ganhar dinheiro</h4>
                    <p className="text-sm text-muted-foreground">com afiliados usando nossa plataforma</p>
                  </div>
                  <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
                    <h4 className="font-semibold mb-2">Como construir</h4>
                    <p className="text-sm text-muted-foreground">sua própria comunidade de vendas e indicação</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                📬 Quer fazer parte?
              </h2>
              <p className="text-xl text-muted-foreground mb-4">
                Preencha o formulário abaixo ou envie um e-mail para:
              </p>
              <a 
                href="mailto:suporte@ganhavel.com" 
                className="inline-flex items-center gap-2 text-lg font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="w-5 h-5" />
                📩 suporte@ganhavel.com
              </a>
            </div>

            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-center">Formulário de Interesse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input id="nome" placeholder="Seu nome completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área de Interesse</Label>
                  <Input id="area" placeholder="Ex: Desenvolvimento, Marketing, Design..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experiencia">Experiência</Label>
                  <Textarea 
                    id="experiencia" 
                    placeholder="Conte-nos sobre sua experiência e como pode contribuir com o Ganhavel"
                    rows={4}
                  />
                </div>
                <Button className="w-full" size="lg">
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar Candidatura
                </Button>
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <p className="text-lg font-medium text-muted-foreground">
                Vamos juntos construir um modelo ético, transparente e altamente lucrativo de prêmios reais no Brasil e no mundo.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}