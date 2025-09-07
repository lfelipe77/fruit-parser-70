import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

type LotteryResult = {
  concurso_number: string | null;
  draw_date: string | null;
  numbers: string[] | null;
}

// Format date in Brazilian format
function dateBR(iso: string | null) {
  if (!iso) return "";
  return dayjs(iso, 'YYYY-MM-DD').format('DD/MM/YYYY');
}

export default function CaixaLotterySection() {
  const { t } = useTranslation();
  const [federalResult, setFederalResult] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch latest federal lottery result from store
        const { data: federalData, error: federalError } = await (supabase as any)
          .from("lottery_latest_federal_store")
          .select("concurso_number, draw_date, numbers")
          .eq("game_slug", "federal")
          .maybeSingle();
        
        if (!federalError && federalData) {
          setFederalResult(federalData);
        } else {
          console.error('Error fetching federal data:', federalError);
        }
        
      } catch (error) {
        console.error('Error fetching lottery data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Sorteios, quartas e sábados</h2>
            <p className="text-muted-foreground">Carregando informações dos sorteios...</p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-3"></div>
              <div className="h-5 bg-muted rounded w-2/3 mx-auto"></div>
            </div>
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
                {federalResult.draw_date ? ` – ${dateBR(federalResult.draw_date)}` : ""}
              </div>
              <div className="mt-2 text-base font-semibold">
                Últimas Dezenas:{" "}
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
                Quartas e sábados às 20:00 horas
              </div>
              <div className="mt-1 text-xs opacity-60">
                Atualizado agora
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground mb-4">
            A Ganhavel apenas conecta participantes com organizadores. Não operamos ganhaveis diretamente nem movimentamos os valores dos bilhetes.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://loterias.caixa.gov.br/Paginas/default.aspx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Acessar site oficial da Caixa
              </a>
            </Button>
            <Button size="sm" asChild>
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