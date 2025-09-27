import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isDebugFlagEnabled } from "@/config/debugFlags";

// Debug logging for URL issues
console.log('[GanhaveisDetail] Component loaded:', { 
  pathname: window.location.pathname, 
  search: window.location.search,
  hash: window.location.hash,
  href: window.location.href 
});
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
import { buildPrettyShareUrlSync } from "@/lib/shareUrl";
import { getAvatarSrc } from "@/lib/avatarUtils";

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
<h4>🏆 Como o ganhador é definido</h4>

<p><strong>💰 Quando completa:</strong> assim que o Ganhável atinge 100%, ele entra no próximo sorteio da Loteria Federal.</p>

<p><strong>🔢 Cálculo do vencedor:</strong> usamos os últimos pares de números da Loteria Federal.</p>

<p>Se houver bilhete exato, ele vence.</p>

<p>Se não houver, vence o mais próximo em ordem crescente.</p>

<p><strong>📊 Transparência total:</strong> sempre mostramos o número sorteado e o bilhete vencedor lado a lado.</p>

<p><strong>🚫 Sem repetições:</strong> cada bilhete é único no sistema.</p>

<h4>✅ Garantia de justiça</h4>

<p>Sorteio 100% vinculado à Loteria Federal.</p>

<p>Zero manipulação ou fraude.</p>

<p>Processo público, rastreável e auditável.</p>

<h4>📦 Entrega do Ganhável</h4>

<p><strong>🛒 Compra feita pelo link de afiliado informado.</strong></p>

<p><strong>📞 Nossa equipe entra em contato para ajustes e confirmação.</strong></p>

<p><strong>📑 Prêmio só é finalizado após comprovação de recebimento.</strong></p>

<p>Assim cada participante tem segurança, justiça e transparência em todo o processo.</p>
`;

function buildShareMeta(raffle: any, origin: string) {
  const price = raffle?.ticket_price ?? raffle?.ticketPrice;
  const goal  = raffle?.goal_amount ?? raffle?.goal;
  const title = raffle?.title ?? "Ganhavel";
  const draw  = raffle?.draw_label ?? raffle?.drawLabel ?? "Sorteio pela Loteria Federal";
  const url   = buildPrettyShareUrlSync({ id: raffle.id, slug: raffle.slug }, origin);
  
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
  const params = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if we're dealing with UUID or slug
  const key = params.slug || params.id || "";
  const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  const isUUID = UUID_RE.test(key);
  const [normalizedOnce, setNormalizedOnce] = React.useState(false);

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
  
  // Calculate minimum quantity required for R$5.00 minimum
  const minQtyRequired = React.useMemo(() => {
    if (!raffle?.ticketPrice) return 1;
    const result = computeCheckout(raffle.ticketPrice, 1);
    return result.qty;
  }, [raffle?.ticketPrice]);
  
  // Track if quantity was auto-adjusted to minimum
  const [wasAutoAdjusted, setWasAutoAdjusted] = React.useState(false);
  
  // Initialize qty to minimum when raffle loads
  React.useEffect(() => {
    if (raffle?.ticketPrice && qty < minQtyRequired) {
      setQty(minQtyRequired);
      setWasAutoAdjusted(true);
    }
  }, [raffle?.ticketPrice, minQtyRequired]);
  
  const lastPaidAgo = useRelativeTime(raffle?.lastPaidAt ?? null, "pt-BR");

  // ---- Winner data for premiado raffles
  const isPremiado = raffle?.status === 'premiado';
  const { data: winner } = useRaffleWinner(raffle?.id, isPremiado);

  // ---- Data fetching function
  const fetchData = React.useCallback(async () => {
    if (!key) return;
    
    try {
      setLoading(true);
      
      // Load raffle data (standardized money view)
      const RAFFLE_CARD_SELECT =
        "id,title,description,image_url,status,ticket_price,goal_amount,amount_raised,progress_pct_money,last_paid_at,created_at,draw_date,category_name,subcategory_name,location_display:location_city,participants_count,direct_purchase_link";

      // Fetch by slug or id depending on what we have
      const query = (supabase as any)
        .from('raffles_public_money_ext')
        .select(RAFFLE_CARD_SELECT);
      
      const { data: v, error: moneyError } = isUUID ? 
        await query.eq('id', key).maybeSingle() :
        await query.eq('slug', key).maybeSingle();
        
      if (moneyError) console.warn("money error", moneyError);
      if (v) {
        setMoneyRow(v as unknown as MoneyRow);
        
        // Fallback: if location_display is null/undefined, fetch from base table
        if (!v.location_display) {
          const { data: r } = await supabase
            .from('raffles')
            .select('location_city')
            .eq(isUUID ? 'id' : 'slug', key)
            .single();
          
          if (r?.location_city) {
            // Update the moneyRow with the fallback location
            const updatedRow = { ...v, location_display: r.location_city };
            setMoneyRow(updatedRow as unknown as MoneyRow);
            console.debug('[Detail] location fallback', { 
              key, 
              fromMoney: v.location_display, 
              fromRaffles: r.location_city 
            });
          }
        }
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
        .select("user_id,organizer_id,description,direct_purchase_link,slug,id")
        .eq(isUUID ? "id" : "slug", key)
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

      // Load organizer profile via raffle-scoped view (anon-safe)
      // Use the actual raffle UUID from baseData, not the key which might be a slug
      const raffleId = baseData?.id;
      const { data: ownerData, error: ownerError } = raffleId ? await supabase
        .from('v_organizer_public' as any)
        .select('organizer_user_id,username,full_name,avatar_url,bio,location,website_url,instagram,twitter,facebook,youtube,tiktok,whatsapp,telegram')
        .eq('raffle_id', raffleId)
        .maybeSingle() : { data: null, error: null };
      
      if (ownerError) console.warn('[GanhaveisDetail] Organizer fetch error:', ownerError);
      setOrganizerData(ownerData);

      // URL normalization - redirect to canonical slug if needed
      if (baseData && !normalizedOnce) {
        const DEBUG_NO_HARD_RELOADS = localStorage.getItem('DEBUG_NO_HARD_RELOADS') !== 'false';
        
        if (isUUID && baseData.slug && !location.pathname.endsWith(`/ganhavel/${baseData.slug}`)) {
          setNormalizedOnce(true);
          // Always use soft normalization to prevent blinks
          const canonicalUrl = `/ganhavel/${baseData.slug}`;
          window.history.replaceState(window.history.state, '', canonicalUrl);
          return;
        }
        
        // If we arrived by slug but it's different in DB, normalize
        if (!isUUID && baseData.slug && key !== baseData.slug) {
          setNormalizedOnce(true);
          if (DEBUG_NO_HARD_RELOADS) {
            // Use history.replaceState to avoid navigation/remount
            const canonicalUrl = `/ganhavel/${baseData.slug}`;
            window.history.replaceState(window.history.state, '', canonicalUrl);
            console.log('[GanhaveisDetail] Soft URL normalization to:', canonicalUrl);
          } else {
            navigate(`/ganhavel/${baseData.slug}`, { replace: true });
          }
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  }, [key, isUUID, location.pathname, navigate, normalizedOnce]);

  // ---- Data load
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Realtime updates
  React.useEffect(() => {
    const DEBUG_DISABLE_30S_JUMP = isDebugFlagEnabled();
    
    // Throttle to prevent fetch storms from events
    let fetchInFlight = false;
    const safeFetchData = async () => {
      if (fetchInFlight) return;
      fetchInFlight = true;
      try {
        await fetchData();
      } finally {
        fetchInFlight = false;
      }
    };
    
    const ch = supabase
      .channel('money-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => safeFetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => safeFetchData())
      .subscribe();

    // Listen for raffle updates from payment success - throttled
    const handleRaffleUpdate = (event: any) => {
      if (event.detail?.raffleId === key) {
        safeFetchData();
      }
    };

    // Add focus/visibility refetch
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[DETAIL]', 'tab became visible - refreshing');
        safeFetchData();
      }
    };

    const handleFocus = () => {
      console.log('[DETAIL]', 'window focused - refreshing');
      safeFetchData();
    };

    window.addEventListener('raffleUpdated', handleRaffleUpdate);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // REMOVED: 30s interval polling permanently - it causes reloads
    // Instead rely ONLY on focus/visibility refetch and realtime events
    // This is now the default behavior for all users
    
    return () => {
      supabase.removeChannel(ch);
      window.removeEventListener('raffleUpdated', handleRaffleUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData, key]);

  // ---- Derived - compute checkout with minimum validation
  const checkoutResult = React.useMemo(() => {
    // Use qty directly, but enforce minimum in calculations
    const effectiveQty = Math.max(minQtyRequired, qty);
    const fee = 2.00;
    const subtotal = effectiveQty * (raffle?.ticketPrice ?? 0);
    const chargeTotal = subtotal + fee;
    
    return {
      qty: effectiveQty,
      fee: Math.round(fee * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      chargeTotal: Math.round(chargeTotal * 100) / 100
    };
  }, [raffle?.ticketPrice, qty, minQtyRequired]);
  
  const { qty: adjustedQty, fee, subtotal, chargeTotal } = checkoutResult;
  const qtyAdjusted = adjustedQty !== qty;
  
  // Debug logging
  console.log('GanhaveisDetail Debug:', {
    qty,
    minQtyRequired,
    adjustedQty,
    qtyAdjusted,
    ticketPrice: raffle?.ticketPrice
  });
  const drawLabel = raffle?.drawDate ? formatDateBR(raffle.drawDate) : "—";
  // Allow purchasing until winner is selected (premiado), not just when active
  const isActive = raffle?.status === "active" || (raffle?.status !== "completed" && raffle?.status !== "premiado");
  
  // SEO Meta data
  const origin = typeof window !== "undefined" ? window.location.origin : "https://ganhavel.com";
  const meta = raffle ? buildShareMeta(raffle, origin) : null;

  // ---- Scroll preservation during updates (belt & suspenders)
  React.useLayoutEffect(() => {
    const DEBUG_DISABLE_30S_JUMP = isDebugFlagEnabled();
    if (!DEBUG_DISABLE_30S_JUMP) return;
    
    const y = window.scrollY;
    return () => {
      // restore on unmount-remount cases
      console.log('[DETAIL]', 'preserving scroll position:', y);
      window.scrollTo({ top: y, behavior: 'auto' });
    };
  }, [key]); // key that would cause remount if any

  // ---- Render
  if (loading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Ganhavel não encontrado.</div>;

  const pageUrl = `${origin}/ganhavel/${raffle.slug || raffle.id}`;

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
          {/* Location Display - city only */}
          {moneyRow?.location_display && (
            <div className="text-sm text-muted-foreground mt-1">
              {moneyRow.location_display}
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="detalhes" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="prose mt-4 max-w-none">
              {/* Description */}
              {moneyRow?.description && (
                <div className="not-prose mb-6 text-muted-foreground whitespace-pre-line leading-relaxed">
                  {moneyRow.description}
                </div>
              )}
            </TabsContent>

            <TabsContent value="regulamento" className="prose mt-4 max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: raffle.regulamentoHtml || FALLBACK_RULES }}
              />
            </TabsContent>
          </Tabs>

          {/* Organizer Profile Section - Always visible */}
          <div className="mt-8">
            <DetalhesOrganizador 
              organizer={{
                id: organizerData?.organizer_user_id || "",
                organizer_user_id: organizerData?.organizer_user_id,
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
                    src={getAvatarSrc(
                      { avatar_url: winner.winner_avatar_url },
                      winner.winner_user_id
                    )}
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
                  onClick={() => {
                    const newQty = Math.max(minQtyRequired, qty - 1);
                    setQty(newQty);
                    if (newQty > minQtyRequired) setWasAutoAdjusted(false);
                  }}
                  disabled={qty <= minQtyRequired}
                  className="rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 w-8 h-8 flex items-center justify-center text-emerald-600 font-medium disabled:opacity-50"
                >
                  –
                </button>
                <span className="w-12 text-center font-semibold">{qty}</span>
                <button 
                  onClick={() => {
                    setQty(qty + 1);
                    setWasAutoAdjusted(false);
                  }}
                  className="rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 w-8 h-8 flex items-center justify-center text-emerald-600 font-medium"
                >
                  +
                </button>
              </div>
              
              {wasAutoAdjusted && qty === minQtyRequired && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  Quantidade ajustada para atender o mínimo de R$5,00.
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

              <Button
                onClick={() => navigate(toConfirm(raffle.id, adjustedQty))}
                disabled={!isActive}
                size="lg"
                className="w-full"
              >
                Comprar {adjustedQty} bilhetes
              </Button>
            </div>
          )}

          {/* Share section */}
          {raffle?.id && (
            <div className="mt-4 pt-4 border-t border-emerald-200">
              <CompartilheRifa raffle={{ id: raffle.id, slug: raffle.slug }} className="w-full" />
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

      
      {/* Completion Detection for this specific raffle */}
      {raffle?.id && (
        <RaffleCompletionTrigger 
          raffleId={raffle.id} 
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