import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { 
  Shield, 
  Award, 
  Users, 
  Target,
  CheckCircle,
  XCircle,
  Gift,
  Scale
} from "lucide-react";

export default function SobreNos() {
  const slogans = [
    "Onde Ganhaveis viram renda",
    "Destruindo Rifas Falsas. Criando Sonhos Reais.",
    "Comprovado. Seguro. Ganhável.",
    "A plataforma que transforma seu link em prêmio."
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sobre Nós
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Conheça a história e missão do Ganhavel
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* About Ganhavel */}
            <Card className="border-2 border-red-500/20 bg-red-500/5">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-red-500" />
                  Sobre o Ganhavel
                </h2>
                <p className="text-lg mb-6 text-muted-foreground">
                  É um absurdo como tantas pessoas ainda estão sendo enganadas por rifas ilegais no Brasil.
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Fazer sorteio próprio é <strong>ILEGAL</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Reter o dinheiro dos participantes é <strong>ILEGAL</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Vender bilhetes de rifa sem seguir a Loteria Federal é <strong>ILEGAL</strong>.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span><strong>LUCRAR</strong> com sorteios é <strong>ILEGAL</strong>.</span>
                  </div>
                </div>
                
                <p className="text-lg font-semibold text-red-600 dark:text-red-400 mb-6">
                  E o pior: tem gente lucrando milhões com isso.
                </p>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-3 text-green-700 dark:text-green-400">
                    GANHAVEL - Transparência Total
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• <strong>Não tem lucro algum</strong> com nenhuma das rifas</p>
                    <p>• Serve somente para todos lançarem produtos e produtos afiliados</p>
                    <p>• Os fundadores, o site e a plataforma não têm lucro algum relacionado aos sorteios das rifas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Ganhavel */}
            <Card className="border-2 border-orange-500/20 bg-orange-500/5">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  🚨 Por isso criamos o Ganhavel
                </h2>
                <p className="text-lg mb-6 text-muted-foreground">
                  O Ganhavel nasceu para dar fim às "rifas falsas" e oferecer uma alternativa 100% transparente, legal e automatizada com inteligência artificial.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Aqui, ninguém faz sorteio próprio.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Utilizamos os resultados oficiais da Loteria Federal da Caixa Econômica.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>Os valores não ficam com a plataforma – vão direto para a compra do prêmio.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ganhaveis */}
            <Card className="border-2 border-green-500/20 bg-green-500/5">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Gift className="w-8 h-8 text-green-500" />
                  Os prêmios são "Ganháveis", não apostáveis.
                </h2>
                <p className="text-lg mb-4 text-muted-foreground">
                  Todos os prêmios vendidos no Ganhavel são produtos reais — comprados automaticamente com o valor arrecadado, e entregues com comprovante fiscal.
                </p>
                <p className="text-lg text-muted-foreground">
                  Se por qualquer motivo o prêmio não puder ser entregue, o ganhador poderá escolher qualquer outro produto disponível no Ganhavel.com, sem prejuízo.
                </p>
              </CardContent>
            </Card>

            {/* Fair Chance */}
            <Card className="border-2 border-blue-500/20 bg-blue-500/5">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <Scale className="w-8 h-8 text-blue-500" />
                  Uma chance justa para todos
                </h2>
                <p className="text-lg mb-4 text-muted-foreground">
                  Nosso objetivo é claro:
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Eliminar as rifas ilegais e criar uma rede de prêmios ganhaveis para todos.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Seja você um criador, afiliado ou participante — no Ganhavel, você joga limpo e com segurança.</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Slogans */}
            <Card className="border-2 border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  ✊ Nossos Valores
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {slogans.map((slogan, index) => (
                    <Badge key={index} variant="secondary" className="text-center p-4 text-base">
                      {slogan}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
    </div>
  );
}