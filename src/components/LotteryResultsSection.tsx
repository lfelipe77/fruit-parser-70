import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, CheckCircle } from "lucide-react";

export default function LotteryResultsSection() {
  // Recent winners data
  const recentWinners = [
    {
      name: "Maria S.",
      prize: "iPhone 15 Pro Max",
      timeAgo: "2 horas atrás",
      location: "São Paulo, SP"
    },
    {
      name: "João P.",
      prize: "Honda Civic 2024",
      timeAgo: "5 horas atrás", 
      location: "Rio de Janeiro, RJ"
    },
    {
      name: "Ana L.",
      prize: "R$ 50.000 em dinheiro",
      timeAgo: "1 dia atrás",
      location: "Belo Horizonte, MG"
    },
    {
      name: "Carlos M.",
      prize: "PS5 + Setup Gamer",
      timeAgo: "2 dias atrás",
      location: "Brasília, DF"
    }
  ];

  // Lottery data for different countries
  const lotteryData = [
    {
      country: "🇺🇸 USA",
      lottery: "Powerball",
      nextDraw: "em 2 dias",
      status: "ativo",
      jackpot: "$143M"
    },
    {
      country: "🇪🇺 Europa",
      lottery: "EuroMillions",
      nextDraw: "hoje às 20:00",
      status: "ativo",
      jackpot: "€95M"
    },
    {
      country: "🇬🇧 Reino Unido",
      lottery: "National Lottery",
      nextDraw: "hoje às 19:45",
      status: "ativo",
      jackpot: "£18M"
    },
    {
      country: "🇧🇷 Brasil",
      lottery: "Loteria Federal",
      nextDraw: "quarta-feira",
      status: "ativo",
      jackpot: "R$ 8M"
    },
    {
      country: "🇨🇦 Canadá",
      lottery: "Lotto Max",
      nextDraw: "sexta-feira",
      status: "acumulado",
      jackpot: "CAD$ 55M"
    },
    {
      country: "🇦🇺 Austrália",
      lottery: "Oz Lotto",
      nextDraw: "resultado disponível",
      status: "finalizado",
      jackpot: "AUD$ 4M"
    }
  ];

  return (
    <section className="py-12 bg-card/30 border-y">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <CheckCircle className="w-4 h-4 mr-2" />
              100% Transparente
            </Badge>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">
              Sorteios pelo site oficial do governo do país de origem do produto
            </h2>
            <p className="text-muted-foreground">
              Todos os sorteios seguem os números oficiais das loterias governamentais
            </p>
            
            {/* Countries and Lotteries Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lotteryData.map((lottery, index) => (
                <div key={index} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm">{lottery.country}</span>
                    <Badge 
                      variant={lottery.status === 'ativo' ? 'default' : lottery.status === 'acumulado' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {lottery.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-primary">{lottery.lottery}</div>
                    <div className="text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {lottery.nextDraw}
                    </div>
                    <div className="text-lg font-bold text-foreground">{lottery.jackpot}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-lg">🏆 Últimos Ganhadores</span>
                </div>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Atualizado</span>
                </Badge>
              </div>
              
              <div className="space-y-4">
                {recentWinners.map((winner, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border/50">
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">{winner.name}</div>
                      <div className="text-sm text-muted-foreground">{winner.location}</div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-medium text-primary">{winner.prize}</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-sm text-muted-foreground">{winner.timeAgo}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center">
                  🏛️ Fonte oficial: <span className="font-semibold">Governo do país de origem</span> - 
                  Garantindo total transparência e confiabilidade nos sorteios
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}