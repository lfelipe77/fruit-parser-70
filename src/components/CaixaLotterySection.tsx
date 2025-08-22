import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Trophy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface LotteryDraw {
  id: string;
  name: string;
  nextDraw: string;
  time: string;
}

type LotteryResult = {
  concurso_number: string | null;
  draw_date: string | null;
  numbers: string[] | null;
};

export default function CaixaLotterySection() {
  const { t } = useTranslation();
  const [lotteryData, setLotteryData] = useState<LotteryDraw[]>([]);
  const [federalResult, setFederalResult] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Placeholder data for empty state
  const placeholderData: LotteryDraw[] = [
    {
      id: 'mega-sena',
      name: 'Mega-Sena',
      nextDraw: 'Em breve',
      time: '20:00'
    },
    {
      id: 'quina',
      name: 'Quina',
      nextDraw: 'Em breve',
      time: '20:00'
    },
    {
      id: 'lotofacil',
      name: 'Lotofácil',
      nextDraw: 'Em breve',
      time: '20:00'
    }
  ];

useEffect(() => {
    const fetchLotteryData = async () => {
      try {
        setLoading(true);
        
        // Fetch next draws
        const { data, error } = await (supabase as any)
          .from('lottery_next_draws')
          .select('game_slug, game_name, next_date, next_time')
          .order('game_slug', { ascending: true });

        if (error) throw error;

        const mapped: LotteryDraw[] = (data ?? []).map((row: any) => {
          const nextDate = row.next_date ? new Date(row.next_date) : null;
          const nextDraw = nextDate ? nextDate.toLocaleDateString('pt-BR') : '—';
          const timeStr = row.next_time ? String(row.next_time).slice(0, 5) : '—';
          return {
            id: row.game_slug,
            name: row.game_name,
            nextDraw,
            time: timeStr,
          };
        });

        setLotteryData(mapped.length > 0 ? mapped : placeholderData);

        // Fetch latest federal lottery result
        const { data: federalData, error: federalError } = await (supabase as any)
          .from("lottery_latest_federal")
          .select("concurso_number, draw_date, numbers")
          .order("draw_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!federalError && federalData) {
          setFederalResult(federalData);
        }
        
      } catch (error) {
        console.error('Error fetching lottery data:', error);
        setLotteryData(placeholderData);
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
            <h2 className="text-3xl font-bold">Sorteios, quartas e sábados</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compartilhe, finalize os recebimentos dos seus ganhaveis e realize sonhos
          </p>
        </div>

        {/* Federal Lottery Results Card */}
        {federalResult && (
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
              <h3 className="text-lg font-semibold">Último sorteio — Loteria Federal</h3>
              <div className="mt-1 text-sm">
                Concurso <span className="font-medium">{federalResult.concurso_number ?? "-"}</span>
                {federalResult.draw_date ? ` – ${new Date(federalResult.draw_date).toLocaleDateString("pt-BR")}` : ""}
              </div>
              <div className="mt-2 text-base font-semibold">
                Números:{" "}
                <span className="font-mono">
                  {(() => {
                    const pares = Array.isArray(federalResult.numbers)
                      ? federalResult.numbers.map(s => String(s).padStart(2, "0"))
                      : [];
                    return pares.join(" ") || "-";
                  })()}
                </span>
              </div>
              <div className="mt-2 text-xs opacity-60">
                Atualizado agora
              </div>
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-center gap-3">
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
            <Button asChild>
              <Link to="/resultados" aria-label="Ver últimos números e ganhadores">
                Últimos Números (Ganhadores)
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}