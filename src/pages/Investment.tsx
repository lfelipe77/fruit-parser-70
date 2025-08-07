import React from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Shield, 
  Calendar,
  Handshake,
  PieChart,
  AlertTriangle,
  Settings,
  CheckCircle
} from 'lucide-react';

const Investment: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Oportunidade de Investimento – Ganhavel + Investidor Parceiro Monew"
        description="Oportunidade única de investir na Ganhavel, plataforma de sorteios reais com modelo validado e time pronto para escalar."
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Oportunidade de Investimento
          </h1>
          <p className="text-xl text-muted-foreground">
            Ganhavel + Investidor Parceiro Monew
          </p>
        </div>

        {/* Visão Geral */}
        <Card className="mb-8 border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Visão Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              Ganhavel é uma plataforma onde qualquer pessoa pode lançar, participar e promover sorteios de prêmios reais ("ganhaveis").
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Produtos diversos: físicos, digitais, afiliados e próprios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Segurança total com validação via Loteria Federal</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Modelo simples: Publica → Vende → Sorteia → Entrega</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span>Pagamento seguro: liberado somente com confirmação de entrega</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estrutura do Investimento */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" />
              Estrutura do Investimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  Fase 1 – Até o Lançamento (Meses 1 a 3)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Felipe (CEO)</div>
                    <div className="text-2xl font-bold text-primary">R$ 30.000</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Albert (Dev)</div>
                    <div className="text-2xl font-bold text-primary">R$ 30.000</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Ferramentas</div>
                    <div className="text-2xl font-bold text-primary">R$ 7.500</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Subtotal: R$ 67.500
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  Fase 1 – Pós-lançamento (Meses 4 a 6)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Felipe (CEO)</div>
                    <div className="text-2xl font-bold text-primary">R$ 30.000</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Albert (Dev)</div>
                    <div className="text-2xl font-bold text-primary">R$ 30.000</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Ferramentas</div>
                    <div className="text-2xl font-bold text-primary">R$ 7.500</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="font-medium">Marketing</div>
                    <div className="text-2xl font-bold text-primary">R$ 30.000</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Subtotal: R$ 97.500
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    Total Fase 1: R$ 165.000 = 15% da empresa
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fase 2 */}
        <Card className="mb-8 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
              Fase 2 — Pós-tração (opcional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-2xl font-bold text-blue-600 mb-2">R$ 200K a R$ 1M</div>
                  <p>Aporte adicional</p>
                  <div className="text-lg font-semibold text-blue-600 mt-2">Até +15% de equity adicional</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Investidor da Fase 1 tem prioridade (right of first refusal)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Critérios de ativação:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Usuários ativos e base engajada
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      Receita gerada
                    </li>
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Engajamento e viralização de campanhas
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fontes de Receita */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Fontes de Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Margem sobre prêmios</div>
                <div className="text-2xl font-bold text-green-600">5% a 20%</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Gateway exclusivo</div>
                <div className="text-2xl font-bold text-green-600">R$ 1,99 +</div>
                <div className="text-sm text-green-600">por transações</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">ADS internos</div>
                <div className="text-sm text-green-600">destaques pagos nas páginas</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="font-semibold text-green-700 dark:text-green-400">Taxa premium</div>
                <div className="text-sm text-green-600">administração premium</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Roadmap de Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-medium">MVP funcional</span>
                <Badge variant="default" className="bg-green-100 text-green-800">✅</Badge>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Finalização do back-end em +30 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Lançamento oficial até 90 dias</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Ativação de afiliados: mês 3–4</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Validação de mercado: mês 4–6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Termos da Parceria */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Handshake className="w-6 h-6 text-blue-600" />
              Termos da Parceria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Gateway oficial por 3 anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span>Exclusividade total nas transações</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Destaque como parceiro oficial</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Receita garantida: R$ 1,99/transação</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição Societária */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-6 h-6 text-orange-600" />
              Distribuição Societária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">50%</div>
                <div className="text-sm font-medium">Luiz Felipe</div>
                <div className="text-xs text-muted-foreground">(Fundador)</div>
              </div>
              <div className="text-center bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">20%</div>
                <div className="text-sm font-medium">Albert Abril</div>
                <div className="text-xs text-muted-foreground">(Dev)</div>
              </div>
              <div className="text-center bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">15%</div>
                <div className="text-sm font-medium">Investidor</div>
                <div className="text-xs text-muted-foreground">Fase 1</div>
              </div>
              <div className="text-center bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">até +15%</div>
                <div className="text-sm font-medium">Investidor</div>
                <div className="text-xs text-muted-foreground">Fase 2</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condições de Performance */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="w-6 h-6" />
              Condições de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Contrato pode ser encerrado com aviso prévio de 3 meses</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Encerramento por falta de performance previamente definida</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Toda transação vinculada a marcos acordados</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Salários negociáveis com base em performance</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <span>Acordo de sócios com cláusulas de proteção, vesting, saída e reinvestimento</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte Esperado */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-indigo-600" />
              Suporte Esperado do Investidor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Estrutura jurídica completa (CNPJ, contratos)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Acordo societário profissional</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Suporte contábil e fiscal básico</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Network estratégico e mentoria</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm">Participação como advisor</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-6 h-6" />
              Resumo Final da Oportunidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📌</span>
                    <span className="font-semibold">R$ 165K por 15% equity (6 meses)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    <span className="font-semibold">R$ 200K–1M futura rodada = até +15%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔐</span>
                    <span className="font-semibold">Exclusividade em todas as transações por 3 anos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    <span className="font-semibold">MVP funcional, time pronto, modelo validado</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-semibold text-primary">
                  Esta é uma oportunidade única de investir com risco protegido, upside claro e um time pronto para escalar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Investment;