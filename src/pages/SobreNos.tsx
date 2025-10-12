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
  const valores = [
    { title: "Transparência", desc: "Nada é escondido. Tudo pode ser rastreado e comprovado." },
    { title: "Segurança", desc: "O dinheiro é protegido até a entrega do prêmio." },
    { title: "Legalidade", desc: "Seguimos 100% as normas da Loteria Federal." },
    { title: "Oportunidade", desc: "Qualquer pessoa pode participar e gerar renda de forma honesta." },
    { title: "Inovação", desc: "Usamos tecnologia e IA para automatizar o que antes era confuso e arriscado." },
    { title: "Propósito", desc: "Transformar o mercado de rifas em um ambiente ético, acessível e sustentável." }
  ];

  const slogans = [
    "Onde Ganháveis Viram Renda",
    "Destruindo rifas falsas. Criando sonhos reais.",
    "Comprovado. Seguro. Ganhável.",
    "A plataforma que transforma seu link em prêmio — e sua confiança em oportunidade."
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
            <p className="text-lg text-muted-foreground/90 max-w-3xl mx-auto">
              O Ganhavel é uma plataforma de sorteios reais, legalizados e auditáveis pela Loteria Federal — onde qualquer pessoa pode lançar, participar ou divulgar prêmios verdadeiros com total transparência, segurança e sem lucro sobre o valor do prêmio.
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

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4 text-green-700 dark:text-green-400">
                    GANHAVEL — Transparência Total
                  </h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>• Não tem lucro algum com nenhuma das rifas.</p>
                    <p>• Serve somente para que qualquer pessoa possa lançar produtos e produtos afiliados.</p>
                    <p>• Os fundadores, o site e a plataforma não têm lucro algum relacionado aos sorteios das rifas.</p>
                  </div>
                  <p className="text-lg mt-6 leading-relaxed">
                    O Ganhavel existe para garantir que cada sorteio aconteça de forma justa, legal e rastreável, utilizando tecnologia e automação para eliminar o risco humano e o favorecimento. Aqui, a plataforma não retém valores, não manipula resultados e não explora o prêmio. O foco é construir confiança, e devolver às pessoas o direito de participar de sorteios verdadeiros, com segurança e legitimidade.
                  </p>
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
                    <span>Utilizamos os resultados oficiais da Loteria Federal da Caixa Econômica — um sistema público, auditável e de total credibilidade.</span>
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
                  Todos os prêmios vendidos no Ganhavel são produtos reais — comprados automaticamente com o valor arrecadado e entregues com comprovante fiscal.
                </p>
                <p className="text-lg text-muted-foreground">
                  Se por qualquer motivo o prêmio não puder ser entregue, o ganhador poderá escolher qualquer outro produto disponível no Ganhavel.com, sem prejuízo. Esse modelo garante que ninguém perca e todos joguem limpo.
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
                <p className="text-lg mb-6 font-semibold">
                  Nosso objetivo é claro:
                </p>
                <p className="text-lg mb-6 text-muted-foreground">
                  Eliminar as rifas ilegais e criar uma rede de prêmios ganháveis para todos. No Ganhavel, cada pessoa pode lançar um prêmio, participar ou divulgar de forma segura, sabendo que o processo é validado por sistemas oficiais.
                </p>
                
                <p className="text-lg mb-4 font-semibold">
                  Além de segurança, o Ganhavel também cria novas fontes de renda:
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Quem lança um Ganhável pode lucrar com links de afiliados.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Quem participa pode concorrer a prêmios reais com total transparência.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span>Quem divulga ajuda o sorteio a acontecer — e ganha junto.</span>
                  </div>
                </div>
                
                <p className="text-lg text-muted-foreground">
                  É um ciclo de confiança, colaboração e oportunidade.
                </p>
                
                <p className="text-lg mt-4 font-semibold">
                  Seja você um criador, afiliado ou participante — no Ganhavel, você joga limpo, com segurança e propósito.
                </p>
              </CardContent>
            </Card>

            {/* Valores */}
            <Card className="border-2 border-purple-500/20 bg-purple-500/5">
              <CardContent className="pt-8">
                <h2 className="text-3xl font-bold mb-6 text-center">
                  ✊ Nossos Valores
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {valores.map((valor, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="font-bold text-lg">{valor.title}</h3>
                      <p className="text-muted-foreground">{valor.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Slogans */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardContent className="pt-8">
                <div className="text-center space-y-4">
                  {slogans.map((slogan, index) => (
                    <p key={index} className="text-xl font-semibold">
                      {slogan}
                    </p>
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