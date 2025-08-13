import { Shield, Zap, GitBranch, Eye, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function AsaasPartnershipSection() {
  const features = [
    {
      icon: Shield,
      title: "Pagamentos 100% Seguros",
      description: "Todos os valores são gerenciados por parceiro financeiro licenciado"
    },
    {
      icon: Zap,
      title: "Automação via PIX",
      description: "Split de pagamento inteligente e automático"
    },
    {
      icon: Eye,
      title: "Transparência Total",
      description: "Rastreabilidade completa em cada transação"
    },
    {
      icon: Building2,
      title: "Conformidade Legal",
      description: "Regulamentação garantida sem intermediários"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950/20 dark:to-slate-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Parceiro Financeiro Oficial
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-slate-100">
            🔐 Segurança Digital pela Asaas
          </h2>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Fintech licenciada e regulamentada para máxima segurança nas transações.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Company Info & CTA */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 md:p-10">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <Building2 className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold text-lg">
                <a href="https://www.asaas.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Asaas - Infraestrutura de Pagamentos Licenciada
                </a>
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              Fintech licenciada e regulamentada
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <Link to="/como-funciona">
                <Eye className="w-4 h-4 mr-2" />
                Saiba como funciona
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white border-0" asChild>
              <Link to="/confianca-seguranca">
                <Shield className="w-4 h-4 mr-2" />
                Segurança & Confiança
                <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}