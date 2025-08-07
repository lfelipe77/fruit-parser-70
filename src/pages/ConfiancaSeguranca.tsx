import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Shield, 
  Lock, 
  Eye, 
  CheckCircle, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Award,
  AlertTriangle,
  Heart,
  Clock,
  Globe,
  DollarSign,
  Building2,
  ExternalLink,
  Banknote
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ConfiancaSeguranca() {
  const securityFeatures = [
    {
      icon: Lock,
      title: "Pagamentos Seguros",
      description: "Utilizamos criptografia SSL e parceiros bancários certificados para proteger suas transações.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Eye,
      title: "Transparência Total",
      description: "Todos os sorteios seguem a Loteria Federal, garantindo total transparência nos resultados.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: UserCheck,
      title: "Moderação Ativa",
      description: "Nossa equipe revisa todos os ganhaveis antes da publicação para garantir qualidade e veracidade.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  const protections = [
    {
      title: "Processo Livre de Fraude",
      items: [
        "Reembolso imediato caso a Rifa trave por 30 dias se receber pagamento",
        "Suporte segunda a sexta das 9h às 17h",
        "Rastreamento completo de todas as transações",
        "Compra imediata de ganhaveis de afiliados validados (Amazon, OLX, Mercado Livre, etc)"
      ]
    },
    {
      title: "Proteção do Vendedor",
      items: [
        "Pagamento garantido após confirmação de entregas",
        "Sincronizamos assinaturas de transferências com pagamentos",
        "Compra imediata de ganhaveis de afiliados validados (Amazon, OLX, Mercado Livre, etc)",
        "Suporte especializado para vendedores"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500/5 via-green-500/5 to-purple-500/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-gradient-primary text-white border-0">
              <Shield className="w-4 h-4 mr-2" />
              Segurança Garantida
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
              Confiança & Segurança
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Sua segurança é nossa prioridade. Conheça todas as medidas que implementamos para proteger você e sua experiência na Ganhavel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8" asChild>
                <Link to="/descobrir">
                  <Eye className="w-5 h-5 mr-2" />
                  Descobrir Ganhaveis
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                <Link to="/como-funciona">
                  <FileText className="w-5 h-5 mr-2" />
                  Como Funciona
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Medidas de Segurança
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Implementamos múltiplas camadas de proteção para garantir uma experiência segura
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                <CardContent className="pt-6">
                  <div className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mb-4 mx-auto`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-center">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Protections */}
      <section className="py-20 bg-gradient-to-br from-card/30 to-card/60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Proteções Implementadas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Garantias específicas para compradores e vendedores
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {protections.map((protection, index) => (
              <Card key={index} className="border-2 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    {protection.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {protection.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Certificações e Parcerias
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trabalhamos com instituições reconhecidas para garantir máxima segurança
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-green-500/20 bg-green-500/5 text-center">
              <CardContent className="pt-6">
                <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">Loteria Federal</h3>
                <p className="text-sm text-muted-foreground">
                  Seguimos rigorosamente os números da Loteria Federal para garantir transparência total
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/20 bg-blue-500/5 text-center">
              <CardContent className="pt-6">
                <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">SSL Certificado</h3>
                <p className="text-sm text-muted-foreground">
                  Criptografia de ponta a ponta em todas as transações financeiras
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500/20 bg-purple-500/5 text-center">
              <CardContent className="pt-6">
                <Globe className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="font-bold mb-2">LGPD Compliance</h3>
                <p className="text-sm text-muted-foreground">
                  Total conformidade com a Lei Geral de Proteção de Dados
                </p>
              </CardContent>
            </Card>
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
                💸 Parceiro Oficial de Pagamentos: Monew
              </h2>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                A Ganhavel conta com a <strong>Monew</strong> como parceira oficial de pagamentos — 
                uma <strong>fintech licenciada</strong>, segura e transparente.
              </p>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Todos os valores pagos pelos participantes ficam sob custódia da Monew, garantindo:
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="border-2 border-green-500/20 bg-green-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-green-700 dark:text-green-400">
                    ✔️ Arrecadação automática via PIX
                  </h3>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-500/20 bg-blue-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-blue-700 dark:text-blue-400">
                    ✔️ Validação da entrega antes de liberar o valor
                  </h3>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-500/20 bg-purple-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-purple-700 dark:text-purple-400">
                    ✔️ Rastreabilidade total do processo
                  </h3>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-500/20 bg-orange-500/5 hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">
                    ✔️ Zero manipulação direta pela Ganhavel
                  </h3>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-8 md:p-12 text-center text-white">
              <Building2 className="w-16 h-16 mx-auto mb-6 text-blue-300" />
              <h3 className="text-2xl font-bold mb-4">
                Com a Monew, você participa com tranquilidade
              </h3>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Sabendo que o dinheiro só será liberado quando o ganhador receber seu prêmio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white text-slate-900 hover:bg-blue-50"
                  asChild
                >
                  <a href="https://monew.com.br" target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4 mr-2" />
                    Saiba mais sobre a Monew
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/como-funciona">
                    <FileText className="w-4 h-4 mr-2" />
                    Como funciona o processo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Precisa de Ajuda?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Nossa equipe de suporte está sempre disponível para esclarecer suas dúvidas sobre segurança
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8">
                <Heart className="w-5 h-5 mr-2" />
                Falar com Suporte
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Clock className="w-5 h-5 mr-2" />
                Central de Ajuda
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Warning Section */}
      <section className="py-16 bg-yellow-500/5 border-t border-yellow-500/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-yellow-700 dark:text-yellow-400">
                      Importante: Como se Proteger
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Nunca compartilhe suas credenciais de acesso</li>
                      <li>• Sempre verifique a autenticidade dos ganhaveis antes de participar</li>
                      <li>• Use apenas os canais oficiais da Ganhavel para comunicação</li>
                      <li>• Reporte qualquer atividade suspeita imediatamente</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}