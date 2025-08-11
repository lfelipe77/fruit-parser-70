import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Calendar, Users, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const recentResults = [
  {
    id: 1,
    title: "Honda Civic 0KM 2024",
    winner: "João S. ****",
    date: "28/07/2025",
    contest: "05675",
    winningNumber: "45",
    totalTickets: 1000,
    participants: 1000,
    prizeValue: "R$ 120.000",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "iPhone 15 Pro Max 256GB",
    winner: "Maria F. ****",
    date: "21/07/2025",
    contest: "05672",
    winningNumber: "156",
    totalTickets: 500,
    participants: 500,
    prizeValue: "R$ 8.500",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    title: "R$ 50.000 em Dinheiro",
    winner: "Carlos R. ****",
    date: "14/07/2025",
    contest: "05669",
    winningNumber: "789",
    totalTickets: 1000,
    participants: 1000,
    prizeValue: "R$ 50.000",
    image: "/placeholder.svg"
  }
];

const upcomingDraws = [
  {
    id: 1,
    title: "Casa em Condomínio - Alphaville",
    drawDate: "10/08/2025",
    contest: "05679",
    totalTickets: 2000,
    soldTickets: 2000,
    prizeValue: "R$ 850.000",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Yamaha MT-03 0KM 2024",
    drawDate: "17/08/2025",
    contest: "05680",
    totalTickets: 800,
    soldTickets: 800,
    prizeValue: "R$ 25.000",
    image: "/placeholder.svg"
  }
];

const almostCompleteDraws = [
  {
    id: 1,
    title: "Setup Gamer Completo + PS5",
    drawDate: "15/08/2025",
    contest: "05681",
    totalTickets: 1000,
    soldTickets: 850,
    prizeValue: "R$ 15.000",
    ticketPrice: 5,
    image: "/placeholder.svg"
  },
  {
    id: 2,
    title: "Casa em Condomínio - Alphaville",
    drawDate: "20/08/2025",
    contest: "05682",
    totalTickets: 1000,
    soldTickets: 850,
    prizeValue: "R$ 850.000",
    ticketPrice: 5,
    image: "/placeholder.svg"
  }
];

export default function Resultados() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-12 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              <Trophy className="w-4 h-4 mr-2" />
              Resultados Oficiais
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              Resultados Ganhavel
            </h1>
            <p className="text-xl text-muted-foreground">
              Confira os ganhadores e resultados oficiais baseados na Loteria Federal
            </p>
            
            {/* Verification banner */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">🏛️ Resultados registrados e verificados com base na Loteria Federal Brasileira</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabbed Results */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="premiadas" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="premiadas">Ganhaveis Premiados</TabsTrigger>
              <TabsTrigger value="completas">Rifas Completas</TabsTrigger>
              <TabsTrigger value="quase-completas">Quase Completas</TabsTrigger>
            </TabsList>

            {/* Rifas Premiadas */}
            <TabsContent value="premiadas" className="space-y-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    Ganhadores
                  </h2>
                  <p className="text-muted-foreground">
                    Sorteios já realizados com ganhadores confirmados
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Verificados</span>
                </Badge>
              </div>
              
              <div className="grid gap-6">
                {recentResults.map((result) => {
                  const rifaId = result.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  return (
                    <Link key={result.id} to={`/ganhavel/${rifaId}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-4 gap-6 items-center">
                            <div className="md:col-span-1">
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Trophy className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {result.date}
                                    </span>
                                    <span>Concurso {result.contest}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
                              <div className="font-bold text-xl text-primary">{result.prizeValue}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">Ganhador</div>
                              <div className="font-semibold text-lg">{result.winner}</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm text-muted-foreground mb-1">100% Vendido</div>
                              <div className="font-semibold text-green-600">{result.participants}/{result.totalTickets}</div>
                              <div className="text-sm text-green-600 font-medium">
                                ✓ Completo
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </TabsContent>

            {/* Rifas Completas */}
            <TabsContent value="completas" className="space-y-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    Rifas Completas
                  </h2>
                  <p className="text-muted-foreground">
                    100% dos números vendidos - aguardando próximo sorteio
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {upcomingDraws.map((draw) => {
                  const rifaId = draw.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  return (
                    <Card key={draw.id} className="border-green-200 bg-green-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{draw.title}</span>
                          <Badge className="bg-green-100 text-green-800">
                            100% Completa
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Próximo Sorteio:</span>
                            <span className="font-semibold">{draw.drawDate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Valor Total:</span>
                            <span className="font-bold text-lg text-primary">{draw.prizeValue}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Concurso:</span>
                            <span className="font-semibold">{draw.contest}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Total de Números:</span>
                            <span className="font-semibold">{draw.totalTickets}</span>
                          </div>
                          <div className="w-full bg-green-200 rounded-full h-3">
                            <div className="bg-green-500 h-3 rounded-full w-full" />
                          </div>
                          <div className="text-center text-sm text-green-700 font-medium">
                            Todos os números vendidos!
                          </div>
                          <Link to={`/ganhavel/${rifaId}`}>
                            <Button variant="outline" className="w-full">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Rifas Quase Completas */}
            <TabsContent value="quase-completas" className="space-y-6 mt-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">
                    Rifas Quase Completas
                  </h2>
                  <p className="text-muted-foreground">
                    Rifas com mais de 80% dos números vendidos
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {almostCompleteDraws.map((draw) => {
                  const percentage = Math.round((draw.soldTickets / draw.totalTickets) * 100);
                  const raised = draw.soldTickets * draw.ticketPrice;
                  const goal = draw.totalTickets * draw.ticketPrice;
                  const missing = goal - raised;
                  const rifaId = draw.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                  
                  return (
                    <Card key={draw.id} className="border-orange-200 bg-orange-50/50">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>{draw.title}</span>
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            {percentage}% Completa
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Data Limite:</span>
                            <span className="font-semibold">{draw.drawDate}</span>
                          </div>
                          
                          {/* Money Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">R$ {raised.toLocaleString('pt-BR')}</span>
                              <span className="text-muted-foreground">de R$ {goal.toLocaleString('pt-BR')}</span>
                            </div>
                            <div className="w-full bg-orange-200 rounded-full h-3">
                              <div 
                                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>{percentage}% arrecadado</span>
                              <span>{draw.soldTickets} participantes</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Faltam:</span>
                            <span className="font-semibold text-orange-600">R$ {missing.toLocaleString('pt-BR')}</span>
                          </div>
                          
                          <Link to={`/ganhavel/${rifaId}`}>
                            <Button className="w-full bg-orange-500 hover:bg-orange-600">
                              <Clock className="w-4 h-4 mr-2" />
                              Últimas Chances!
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Transparency Info */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Transparência Total
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Todos os nossos sorteios seguem os números oficiais da Loteria Federal do País de Origem do Produto, 
              garantindo total transparência e confiabilidade no processo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                Ver no Site da Caixa
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/como-funciona">Como Funciona</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}