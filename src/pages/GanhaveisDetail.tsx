import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatBRL, formatDateBR } from "@/lib/formatters";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import DetalhesOrganizador from "@/components/DetalhesOrganizador";
import ShareButton from "@/components/ShareButton";
import { toRaffleView, type MoneyRow, type RaffleExtras } from "@/adapters/raffleAdapters";
import { toConfirm } from "@/lib/nav";

const FALLBACK_DETAILS = `
<h3>Detalhes do Prêmio</h3>
<p><strong>Especificações</strong></p>
<ul>
<li>Modelo: Honda Civic LX CVT 2024</li>
<li>Cor: Preto</li>
<li>Combustível: Flex</li>
<li>Câmbio: Automático CVT</li>
<li>Garantia: 3 anos de fábrica</li>
</ul>
<p><strong>Documentação</strong></p>
<ul>
<li>Nota fiscal em nome do ganhador</li>
<li>IPVA 2024 pago</li>
<li>Seguro obrigatório</li>
<li>Manual do proprietário</li>
<li>Chaves originais (2 unidades)</li>
</ul>
`;

const FALLBACK_RULES = `
<h3>Regulamento da Rifa</h3>
<h4>🏆 COMO O GANHADOR É DEFINIDO</h4>
<ol>
<li><strong>Sorteio acontece</strong><br/>Utilizamos o número da Loteria Federal do país de origem do prêmio.</li>
<li><strong>Comparação com os bilhetes vendidos</strong><br/>Se houver um bilhete com o número exato → esse é o ganhador.<br/>Se nenhum tiver o número exato → vale o mais próximo em ordem crescente.</li>
<li><strong>Critério de desempate</strong><br/>Se dois ou mais bilhetes forem igualmente próximos, vence quem comprou primeiro.</li>
<li><strong>Sem repetições</strong><br/>Cada bilhete é único no sistema. Um número premiado não pode ser repetido em outro sorteio.</li>
</ol>
<p>✅ <strong>Garantia de Justiça</strong></p>
<ul>
<li>Sorteio 100% vinculado à Loteria Federal</li>
<li>Zero manipulação / nenhuma fraude</li>
<li>Processo rastreável, seguro e auditável</li>
</ul>
`;


export default function GanhaveisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ---- Hooks (always first)
  const [moneyRow, setMoneyRow] = React.useState<MoneyRow | null>(null);
  const [extrasRow, setExtrasRow] = React.useState<RaffleExtras | null>(null);
  const [organizerData, setOrganizerData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [qty, setQty] = React.useState(1);
  const [directLink, setDirectLink] = React.useState<string | null>(null);

  // ---- Data normalization
  const raffle = React.useMemo(() => 
    moneyRow ? toRaffleView(moneyRow, extrasRow || {}) : null, 
    [moneyRow, extrasRow]
  );
  
  const lastPaidAgo = useRelativeTime(raffle?.lastPaidAt ?? null, "pt-BR");

  // ---- Data fetching function
  const fetchData = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Load raffle data (standardized money view)
  const RAFFLE_CARD_SELECT =
    "id,title,description,image_url,status,ticket_price,goal_amount,amount_raised,progress_pct_money,last_paid_at,created_at,draw_date,category_name,subcategory_name,location_city,location_state,participants_count,direct_purchase_link";

      const { data: v, error: moneyError } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select(RAFFLE_CARD_SELECT)
        .eq('id', id)
        .maybeSingle();
        
      if (moneyError) console.warn("money error", moneyError);
      setMoneyRow(v ? v as unknown as MoneyRow : null);

      // Load extras from base table
      const { data: baseData, error: baseError } = await supabase
        .from("raffles")
        .select("user_id,description,direct_purchase_link")
        .eq("id", id)
        .maybeSingle();
      if (baseError) console.warn("extras error", baseError);
      if (baseData) {
        setExtrasRow({
          user_id: baseData.user_id, 
          vendor_url: baseData.direct_purchase_link || "", 
          location_city: "", 
          location_state: "" 
        });
        // Set direct purchase link from fallback or view
        const link = (v && 'direct_purchase_link' in v && v.direct_purchase_link) || baseData.direct_purchase_link;
        setDirectLink(link || null);
      }

      // Load organizer profile if available
      if (baseData?.user_id) {
        const { data: ownerData, error: ownerError } = await supabase
          .from("user_profiles_public")
          .select("*")
          .eq("id", baseData.user_id)
          .maybeSingle();
        if (ownerError) console.warn("owner error", ownerError);
        setOrganizerData(ownerData);
      } else {
        setOrganizerData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  // ---- Data load
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Realtime updates
  React.useEffect(() => {
    const ch = supabase
      .channel('money-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => fetchData())
      .subscribe();

    // Listen for raffle updates from payment success
    const handleRaffleUpdate = (event: any) => {
      if (event.detail?.raffleId === id) {
        fetchData();
      }
    };

    window.addEventListener('raffleUpdated', handleRaffleUpdate);
    const interval = setInterval(fetchData, 30000); // safety refresh
    
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener('raffleUpdated', handleRaffleUpdate);
      clearInterval(interval);
    };
  }, [fetchData, id]);

  // ---- Derived
  const feeFixed = 2;
  const subtotal = (raffle?.ticketPrice ?? 0) * qty;
  const total = subtotal + feeFixed;
  const drawLabel = raffle?.drawDate ? formatDateBR(raffle.drawDate) : "—";
  const isActive = raffle?.status === "active";

  // ---- Render
  if (loading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Ganhavel não encontrado.</div>;

  const pageUrl = `${location.origin}/#/ganhavel/${raffle.id}`;

  return (
    <>
      <Navigation />
      <div className="container mx-auto p-4 space-y-4">
        {/* Back button */}
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200">
              <Share2 className="h-4 w-4 mr-2" />
              <ShareButton 
                title={raffle.title} 
                url={pageUrl}
              />
            </Button>
          </div>
        </div>

      {/* Image + Title */}
      <div className="grid gap-6 md:grid-cols-[1fr,360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border bg-white">
            <img
              src={raffle.img || "https://placehold.co/1200x675?text=Imagem+indispon%C3%ADvel"}
              alt={raffle.title}
              className="h-auto w-full object-cover"
            />
          </div>

          <h1 className="mt-4 text-2xl font-semibold">{raffle.title}</h1>

          {/* Tabs */}
          <Tabs defaultValue="detalhes" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="prose mt-4 max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: raffle.detalhesHtml || FALLBACK_DETAILS }}
              />
            </TabsContent>

            <TabsContent value="regulamento" className="prose mt-4 max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: raffle.regulamentoHtml || FALLBACK_RULES }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: money box */}
        <aside className="rounded-2xl border p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 shadow-lg">
          {/* Campaign Progress Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3">Progresso da Campanha</h3>
            <div className="text-sm text-gray-600 mb-2">
              {formatBRL(moneyRow?.amount_raised || 0)} <span className="text-gray-400">de</span> {formatBRL(moneyRow?.goal_amount || 0)}
            </div>
            <div className="mt-2">
              {(() => {
                // Use backend progress_pct_money with defensive fallback
                const progress = moneyRow?.progress_pct_money ?? (
                  (moneyRow?.goal_amount ?? 0) > 0 
                    ? Math.min(100, Math.max(0, Math.round(((moneyRow?.amount_raised ?? 0) / (moneyRow?.goal_amount ?? 1)) * 100)))
                    : 0
                );
                const pct = Math.max(0, Math.min(100, progress));
                
                return (
                  <>
                    <div className="w-full bg-emerald-200 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 text-sm text-emerald-700 font-medium">{pct}% arrecadado</div>
                  </>
                );
              })()}
            </div>
            <div className="text-sm text-gray-600">Último pagamento: {moneyRow?.last_paid_at ? lastPaidAgo : "—"}</div>
          </div>

          <div className="space-y-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Bilhete</div>
            <div className="text-2xl font-bold text-emerald-700">{formatBRL(raffle.ticketPrice)}</div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-2">
              <button 
                onClick={() => setQty(q => Math.max(1, q - 1))} 
                className="rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 w-8 h-8 flex items-center justify-center text-emerald-600 font-medium"
              >
                –
              </button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button 
                onClick={() => setQty(q => q + 1)} 
                className="rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 w-8 h-8 flex items-center justify-center text-emerald-600 font-medium"
              >
                +
              </button>
            </div>

            <div className="space-y-2 bg-white rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span>Bilhetes ({qty}x):</span><span>{formatBRL(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxa institucional:</span><span>{formatBRL(feeFixed)}</span>
              </div>
              <hr className="my-2 border-gray-200" />
              <div className="flex justify-between font-bold text-lg text-emerald-700">
                <span>Total a pagar</span><span>{formatBRL(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate(toConfirm(raffle.id, qty))}
              disabled={!isActive}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comprar {qty} bilhetes
            </button>

            {/* Direct Purchase Link */}
            {directLink && (
              <div className="mt-6 pt-6 border-t border-emerald-200">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-blue-800 mb-3">🛒 Compra Direta</h4>
                  <p className="text-sm text-blue-700 mb-3">Prefere comprar direto com o vendedor?</p>
                  <a
                    href={directLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                  >
                    🔗 Comprar diretamente
                  </a>
                </div>
              </div>
            )}

            {/* Regulamento Section */}
            <div className="mt-6 pt-6 border-t border-emerald-200">
              <h4 className="text-md font-semibold text-emerald-800 mb-3">📋 Regulamento</h4>
              <div className="bg-white rounded-lg p-4 text-sm text-gray-700 space-y-2">
                <p className="font-medium text-emerald-700">🏆 Como o ganhador é definido:</p>
                <ul className="space-y-1 text-xs leading-relaxed">
                  <li>• Sorteio através da Loteria Federal</li>
                  <li>• Bilhete com número exato ou mais próximo</li>
                  <li>• Em caso de empate: quem comprou primeiro</li>
                  <li>• Processo 100% transparente e auditável</li>
                </ul>
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs text-emerald-600 font-medium">✅ Garantia total de justiça e transparência</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Organizer Profile Section */}
      <div className="mt-8">
        <DetalhesOrganizador 
          organizer={{
            name: organizerData?.full_name || organizerData?.username || "Organizador",
            username: organizerData?.username || "user",
            bio: organizerData?.bio || "Organizador experiente na plataforma.",
            location: organizerData?.location || "Brasil",
            memberSince: "Janeiro 2023", // TODO: wire from created_at
            totalGanhaveisLancados: 47, // TODO: aggregate from raffles
            ganhaveisCompletos: 43, // TODO: aggregate completed
            totalGanhaveisParticipados: 156, // TODO: aggregate participations
            ganhaveisGanhos: 2, // TODO: aggregate wins
            avaliacaoMedia: 4.8, // TODO: wire from ratings
            totalAvaliacoes: 234, // TODO: aggregate reviews
            avatar: organizerData?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            website: organizerData?.website_url || null,
            socialLinks: {
              instagram: organizerData?.instagram || null,
              facebook: organizerData?.facebook || null,
              twitter: organizerData?.twitter || null,
              linkedin: null // TODO: wire linkedin field
            }
          }}
        />
      </div>
      </div>
    </>
  );
}