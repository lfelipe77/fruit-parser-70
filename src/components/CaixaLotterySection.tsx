import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Trophy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LotteryDraw {
  id: string;
  name: string;
  nextDraw: string;
  time: string;
}

export default function CaixaLotterySection() {
  const { t } = useTranslation();
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample data - replace with actual API call
  const sampleData: LotteryDraw[] = [
    {
      id: 'mega-sena',
      name: 'Mega-Sena',
      nextDraw: '10/08/2024',
      time: '20:00'
    },
    {
      id: 'quina',
      name: 'Quina',
      nextDraw: '09/08/2024',
      time: '20:00'
    },
    {
      id: 'lotofacil',
      name: 'Lotofácil',
      nextDraw: '09/08/2024',
      time: '20:00'
    }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call to Supabase edge function
    const fetchLotteryData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLotteryData(sampleData);
      } catch (error) {
        console.error('Error fetching lottery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLotteryData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Próximos Sorteios da Caixa</h2>
            <p className="text-muted-foreground">Carregando informações dos próximos sorteios...</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-8 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://logoeps.com/wp-content/uploads/2013/03/caixa-vector-logo.png" 
              alt="Caixa Econômica Federal" 
              className="h-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h2 className="text-3xl font-bold">Próximos Sorteios da Caixa</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compartilhe, finalize os recebimentos dos seus ganhaveis e realize sonhos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {lotteryData.map((lottery) => (
            <Card key={lottery.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {lottery.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Próximo sorteio: {lottery.nextDraw}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Horário: {lottery.time}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-8">
          <div className="bg-primary/10 border border-primary/20 p-6 rounded-xl max-w-4xl mx-auto shadow-lg">
            <p className="text-base font-medium text-primary">
              A Ganhavel apenas conecta participantes com organizadores. Não operamos ganhaveis diretamente nem movimentamos os valores dos bilhetes.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button variant="secondary" asChild>
            <a 
              href="https://loterias.caixa.gov.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Acessar site oficial da Caixa
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}