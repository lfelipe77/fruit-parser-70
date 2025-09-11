import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatBRL, formatDateBR } from "@/lib/formatters";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import DetalhesOrganizador from "@/components/DetalhesOrganizador";
import CompartilheRifa from "@/components/CompartilheRifa";
import { toRaffleView, type MoneyRow, type RaffleExtras } from "@/adapters/raffleAdapters";
import { toConfirm } from "@/lib/nav";
import { computeCheckout } from "@/utils/money";
import { RaffleCompletionTrigger } from "@/components/RaffleCompletionTrigger";
import SEOHead from "@/components/SEOHead";
import { getProductSchema } from "@/utils/structuredData";
import { formatBRL as formatBRLUtils } from "@/utils/money";
import { useRaffleWinner } from "@/hooks/useRaffleWinner";

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
<li><strong>Sem repetições</strong><br/>Cada bilhete é único no sistema. Um número premiado não pode ser repetido em outro sorteio.</li>
</ol>
<p>✅ <strong>Garantia de Justiça</strong></p>
<ul>
<li>Sorteio 100% vinculado à Loteria Federal</li>
<li>Zero manipulação / nenhuma fraude</li>
<li>Processo rastreável, seguro e auditável</li>
<li>O site, toda a lógica e toda operação é 100% transparente e auditável</li>
</ul>
`;

function buildShareMeta(raffle: any, origin: string) {
  const price = raffle?.ticket_price ?? raffle?.ticketPrice;
  const goal  = raffle?.goal_amount ?? raffle?.goal;
  const title = raffle?.title ?? "Ganhavel";
  const draw  = raffle?.draw_label ?? raffle?.drawLabel ?? "Sorteio pela Loteria Federal";
  const url   = `${origin}/#/ganhavel/${raffle.id}`;
  
  // ✅ FIX: Ensure absolute URL for social media sharing
  let img = raffle?.image_url ?? raffle?.img ?? "/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png";
  if (img.startsWith('/')) {
    img = `${origin}${img}`;
  }

  const description = [
    `Compartilhe e participe deste ganhavel: ${title}!`,
    price ? `Bilhetes a partir de ${formatBRLUtils(price)}.` : null,
    `🎯 ${draw}`,
    goal ? `Meta: ${formatBRLUtils(goal)}.` : null,
    `✅ Transparência total e sorte oficial.`
  ].filter(Boolean).join(" ");

  // Texto curtinho e inspirador (para copiar/WhatsApp)
  const shareText = `🎯 ${title} • ${draw}\n` +
    (price ? `💰 Bilhetes: ${formatBRLUtils(price)}\n` : "") +
    `✅ Transparência e sorte oficial.\n` +
    `🎁 Participe: ${url}`;

  return { 
    title: `${title} - Ganhavel`, 
    description, 
    url, 
    img, 
    shareText,
    imageAlt: `${title} - Ganha prêmios incríveis com transparência total`,
    price,
    goal
  };
}


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
  const [locationData, setLocationData] = React.useState<{city: string | null, state: string | null}>({city: null, state: null});

  // ---- Data normalization
  const raffle = React.useMemo(() => 
    moneyRow ? toRaffleView(moneyRow, extrasRow || {}) : null, 
    [moneyRow, extrasRow]
  );
  
  const lastPaidAgo = useRelativeTime(raffle?.lastPaidAt ?? null, "pt-BR");

  // ---- Winner data for premiado raffles
  const isPremiado = raffle?.status === 'premiado';
  const { data: winner } = useRaffleWinner(raffle?.id, isPremiado);

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
      // Add location_label to moneyRow
      if (v) {
        const moneyRowWithLocation = {
          ...v,
          location_label: v.location_city && v.location_state 
            ? `${v.location_city} (${v.location_state})`
            : v.location_city || v.location_state || null
        };
        setMoneyRow(moneyRowWithLocation as unknown as MoneyRow);
      } else {
        setMoneyRow(null);
      }
      
      // Store location data separately
      if (v) {
        setLocationData({
          city: v.location_city || null,
          state: v.location_state || null
        });
      }

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

  // ---- Derived - compute checkout with minimum validation
  const { qty: adjustedQty, fee, subtotal, chargeTotal } = React.useMemo(() => {
    return computeCheckout(raffle?.ticketPrice ?? 0, qty);
  }, [raffle?.ticketPrice, qty]);
  
  const qtyAdjusted = adjustedQty !== qty;
  const drawLabel = raffle?.drawDate ? formatDateBR(raffle.drawDate) : "—";
  // Allow purchasing until winner is selected (premiado), not just when active
  const isActive = raffle?.status === "active" || (raffle?.status !== "completed" && raffle?.status !== "premiado");
  
  // SEO Meta data
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ganhavel.com";
  const meta = raffle ? buildShareMeta(raffle, origin) : null;

  // ---- Render
  if (loading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Ganhavel não encontrado.</div>;

  const pageUrl = `${location.origin}/#/ganhavel/${raffle.id}`;

  return (
    <>
      {meta && (
        <SEOHead
          title={meta.title}
          description={meta.description}
          canonical={meta.url}
          ogImage={meta.img}
          ogImageAlt={meta.imageAlt}
          ogType="product"
          price={meta.price}
          author={raffle?.ownerUserId ? "Organizador Verificado" : undefined}
          structuredData={raffle ? getProductSchema(raffle) : undefined}
        />
      )}
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
          {(moneyRow as any)?.location_label && (
            <div className="text-sm text-muted-foreground mt-1">
              {(moneyRow as any).location_label}
            </div>
          )}
          
          {/* Location Display */}
          {(locationData.city || locationData.state) && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-1 border bg-blue-50/60 border-blue-200">
              <span aria-hidden className="text-blue-600">📍</span>
              <span className="text-sm font-medium text-blue-800">
                {(() => {
                  // Handle cases where data might be parsed incorrectly
                  const city = locationData.city || "";
                  const state = locationData.state || "";
                  
                  // If city contains state info (like "Campinas SP"), extract properly
                  const cityStateMatch = city.match(/^(.*?)\s+([A-Z]{2})$/);
                  if (cityStateMatch && !state) {
                    return `${cityStateMatch[1]} (${cityStateMatch[2]})`;
                  }
                  
                  // Normal case: separate city and state
                  if (city && state && city !== state) {
                    return `${city} (${state})`;
                  }
                  
                  // Fallback: just show what we have
                  return city || state;
                })()}
              </span>
            </div>
          )}

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

          {/* Organizer Profile Section - Hidden on mobile */}
          <div className="mt-8 hidden md:block">
            <DetalhesOrganizador 
              organizer={{
                id: organizerData?.id || "",
                name: organizerData?.full_name || organizerData?.username || "Organizador",
                username: organizerData?.username || "user",
                bio: organizerData?.bio || "Organizador experiente na plataforma.",
                location: organizerData?.location || "Brasil",
                memberSince: "Janeiro 2023", // TODO: wire from created_at
                avatar_url: organizerData?.avatar_url,
                updated_at: organizerData?.updated_at
              }}
            />
          </div>
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

          {isPremiado ? (
            winner ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-2 text-center text-emerald-800 font-semibold">
                  🏆 Ganhador Sorteado
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                  <img
                    src={winner.winner_avatar_url || '/default-avatar.png'}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <a
                      href={`/perfil/${winner.winner_handle || winner.winner_user_id}`}
                      className="truncate font-medium text-emerald-700 hover:underline"
                    >
                      {winner.winner_handle || 'Ganhador'}
                    </a>
                    <div className="text-xs text-gray-600">
                      Bilhete: {winner.winning_ticket ? 
                        winner.winning_ticket.match(/.{1,2}/g)?.join(' · ') ?? winner.winning_ticket 
                        : '-'}
                    </div>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md bg-white p-2">
                    <dt className="text-gray-500">Concurso</dt>
                    <dd className="font-medium">{winner.concurso_number || '-'}</dd>
                  </div>
                  <div className="rounded-md bg-white p-2">
                    <dt className="text-gray-500">Data</dt>
                    <dd className="font-medium">
                      {winner.draw_date ? new Date(winner.draw_date).toLocaleDateString() : '-'}
                    </dd>
                  </div>
                  <div className="col-span-2 rounded-md bg-white p-2">
                    <dt className="text-gray-500">Últimas dezenas (Federal)</dt>
                    <dd className="font-medium">{winner.federal_pairs || '-'}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-sm text-gray-600">
                Aguardando publicação do resultado…
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Valor do Ganhavel</div>
                <div className="text-2xl font-bold text-emerald-700">{formatBRL(raffle.goal)}</div>
              </div>

              <div className="flex items-center gap-3 bg-white rounded-lg p-2">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))} 
                  className="rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 w-8 h-8 flex items-center justify-center text-emerald-600 font-medium"
                >
                  –
                </button>
                <span className="w-12 text-center font-semibold">{adjustedQty}</span>
                <button 
                  onClick={() => setQty(q => q + 1)} 
                  className="rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 w-8 h-8 flex items-center justify-center text-emerald-600 font-medium"
                >
                  +
                </button>
              </div>
              
              {qtyAdjusted && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  Quantidade ajustada para atender o mínimo de R$ 5,00.
                </div>
              )}

              <div className="space-y-2 bg-white rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span>Bilhetes ({adjustedQty}x):</span><span>{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxa institucional:</span><span>{formatBRL(fee)}</span>
                </div>
                <hr className="my-2 border-gray-200" />
                <div className="flex justify-between font-bold text-lg text-emerald-700">
                  <span>Total a pagar</span><span>{formatBRL(chargeTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(toConfirm(raffle.id, adjustedQty))}
                disabled={!isActive}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comprar {adjustedQty} bilhetes
              </button>
            </div>
          )}

          {/* Share section */}
          {raffle?.id && (
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <CompartilheRifa raffleId={raffle.id} className="" />
            </div>
          )}

          {/* Direct Purchase Link - HIGHLIGHTED */}
          {directLink && (
            <div className="mt-6 pt-6 border-t border-emerald-200">
              <div className="bg-gradient-to-r from-amber-50 to-orange-100 border-2 border-orange-200 rounded-lg p-5 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🛒</span>
                  <h4 className="text-lg font-bold text-orange-800">Compra Direta ou Negociação</h4>
                </div>
                <p className="text-sm text-orange-700 mb-4 font-medium">
                  ⚡ Prefere tratar direto? Clique aqui para negociar com o vendedor <strong>ou comprar pelo link de afiliado oficial</strong>.
                </p>
                <a
                  href={directLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  🔗 Negociar / Comprar Direto
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
        </aside>
      </div>

      {/* Organizer Profile Section - Mobile only */}
      <div className="mt-8 md:hidden">
        <DetalhesOrganizador 
          organizer={{
            id: organizerData?.id || "",
            name: organizerData?.full_name || organizerData?.username || "Organizador",
            username: organizerData?.username || "user",
            bio: organizerData?.bio || "Organizador experiente na plataforma.",
            location: organizerData?.location || "Brasil",
            memberSince: "Janeiro 2023", // TODO: wire from created_at
            avatar: organizerData?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          }}
        />
      </div>
      
      {/* Completion Detection for this specific raffle */}
      {id && (
        <RaffleCompletionTrigger 
          raffleId={id} 
          onCompletion={(raffleId) => {
            console.log(`[GanhaveisDetail] Raffle ${raffleId} completed, triggering refresh...`);
            // Trigger a data refresh when this raffle completes
            setTimeout(() => {
              fetchData();
            }, 2000);
          }}
        />
      )}
      </div>
    </>
  );
}