import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatDateBR } from "@/lib/formatters";
import type { RafflePublicMoney } from "@/types/public-views";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import Navigation from "@/components/Navigation";

export default function GanhaveisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ---- All hooks declared first (unconditionally)
  const [raffle, setRaffle] = React.useState<RafflePublicMoney | null>(null);
  const [extras, setExtras] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [qty, setQty] = React.useState(1);

  const lastPaidAgo = useRelativeTime(raffle?.last_paid_at ?? null, "pt-BR");

  // ---- Data loading (parallel fetch)
  React.useEffect(() => {
    console.log('[GanhaveisDetail] Starting data fetch for ID:', id);
    
    if (!id) {
      console.log('[GanhaveisDetail] No ID provided');
      setLoading(false);
      return;
    }
    
    let alive = true;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[GanhaveisDetail] Fetching both money and details data...');

        // Fetch money data and detailed content in parallel
        const [moneyResponse, extrasResponse] = await Promise.all([
          (supabase as any)
            .from("raffles_public_money_ext")
            .select("id,title,description,image_url,status,ticket_price,draw_date,category_name,subcategory_name,amount_raised,goal_amount,progress_pct_money,last_paid_at")
            .eq("id", id)
            .maybeSingle(),
          
          (supabase as any)
            .from("raffles")
            .select("user_id,vendor_link,location_city,location_state,details_html,regulation_html,prize_details,description_long,details_md,regulamento,regras_html,long_description")
            .eq("id", id)
            .maybeSingle()
        ]);

        console.log('[GanhaveisDetail] Money data:', moneyResponse);
        console.log('[GanhaveisDetail] Extras data:', extrasResponse);

        if (!alive) return;
        
        const raffleData = (moneyResponse.data ?? null) as RafflePublicMoney | null;
        const extrasData = extrasResponse.data ?? null;
        
        setRaffle(raffleData);
        setExtras(extrasData);

      } catch (error) {
        console.error('[GanhaveisDetail] Error fetching data:', error);
        if (alive) {
          setRaffle(null);
          setExtras(null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      alive = false;
    };
  }, [id]);

  // ---- Derived state (computed from data)
  const pct = Math.max(0, Math.min(100, raffle?.progress_pct_money ?? 0));
  const isActive = raffle?.status === "active";
  const feeFixed = 2.0;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;
  const drawLabel = raffle?.draw_date ? formatDateBR(raffle.draw_date) : "—";
  const cityState = [extras?.location_city, extras?.location_state].filter(Boolean).join(", ");
  const htmlDetails = extras?.details_html || extras?.description_long || extras?.long_description || raffle?.description || "";
  const htmlReg = extras?.regulation_html || extras?.regulamento || extras?.regras_html || "";

  // ---- Actions
  const handleBuy = () => {
    if (!raffle) return;
    navigate(`/ganhavel/${raffle.id}/confirmacao-pagamento?qty=${qty}`);
  };

  // ---- Render
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">Carregando…</div>
      </div>
    );
  }
  
  if (!raffle) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="p-6">Ganhavel não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-3 text-xs text-gray-600">
          🇧🇷 Loteria Federal • Próximo sorteio: {drawLabel}
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr,360px]">
          {/* LEFT: Tabs with detailed content */}
          <div>
            <h1 className="mb-2 text-2xl font-semibold">{raffle.title}</h1>
            {raffle.description && <p className="mb-4 text-gray-700">{raffle.description}</p>}
            
            {/* Category badges and location */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {raffle.category_name && (
                <Badge variant="secondary">{raffle.category_name}</Badge>
              )}
              {raffle.subcategory_name && (
                <Badge variant="outline">{raffle.subcategory_name}</Badge>
              )}
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
              {cityState && (
                <Badge variant="outline">📍 {cityState}</Badge>
              )}
            </div>

            <Tabs defaultValue="detalhes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
              </TabsList>

              <TabsContent value="detalhes" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Detalhes do Prêmio</h3>
                  {htmlDetails ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlDetails }} />
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="regulamento" className="mt-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Regulamento da Rifa</h3>
                  {htmlReg ? (
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: htmlReg }} />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <p>Este sorteio é regido pelas seguintes regras:</p>
                      <ol>
                        <li>Utilizamos o número da Loteria Federal.</li>
                        <li>Se houver um bilhete com o número exato → esse é o ganhador; senão, vale o mais próximo em ordem crescente.</li>
                        <li>Em caso de empate, vence quem comprou primeiro.</li>
                        <li>Cada bilhete é único e não se repete.</li>
                      </ol>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT: Money box */}
          <aside className="rounded-2xl border p-4">
            <div className="text-sm text-gray-600">
              {formatBRL(raffle.amount_raised)}{" "}
              <span className="text-gray-400">de</span>{" "}
              {formatBRL(raffle.goal_amount)}
            </div>

            <div className="mt-2">
              <Progress value={pct} className="h-2" />
            </div>

            <div className="mt-2 text-sm text-gray-600">
              Sorteio: {pct}% completo
            </div>
            <div className="text-sm text-gray-600">
              Último pagamento: {lastPaidAgo}
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs text-gray-500">Bilhete</div>
              <div className="text-lg font-semibold">{formatBRL(raffle.ticket_price)}</div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="rounded border px-2 py-1"
                >
                  –
                </button>
                <span className="w-8 text-center">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="rounded border px-2 py-1"
                >
                  +
                </button>
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span>Bilhetes ({qty}x):</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa institucional:</span>
                <span>{formatBRL(feeFixed)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total a pagar</span>
                <span>{formatBRL(total)}</span>
              </div>

              <button
                onClick={handleBuy}
                disabled={!isActive}
                className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-white disabled:opacity-50"
              >
                Comprar {qty} bilhetes
              </button>

              <p className="text-xs text-gray-500">
                Taxa institucional: R$ 2,00 destinados à instituição financeira
                para processamento e segurança dos pagamentos.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}