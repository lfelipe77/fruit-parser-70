import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { formatBRL, formatDateBR } from "@/lib/formatters";

type RafflePublicMoney = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  ticket_price: number;
  draw_date: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount_raised: number;
  goal_amount: number;
  progress_pct_money: number;
  last_paid_at: string | null;
};

type Extras = {
  user_id: string | null;
  vendor_url: string | null;
  location_city: string | null;
  location_state: string | null;
  details_html?: string | null;
  regulation_html?: string | null;
  prize_details?: string | null;
  description_long?: string | null;
};

// Fallbacks (what you sent) if DB fields are empty
const FALLBACK_DETALHES = `Detalhes do Prêmio
Especificações
• Modelo: Honda Civic LX CVT 2024
• Cor: Preto
• Combustível: Flex
• Câmbio: Automático CVT
• Garantia: 3 anos de fábrica
Documentação
• Nota fiscal em nome do ganhador
• IPVA 2024 pago
• Seguro obrigatório
• Manual do proprietário
• Chaves originais (2 unidades)`;

const FALLBACK_REGULAMENTO = `Regulamento da Rifa
🏆
COMO O GANHADOR É DEFINIDO
1. Sorteio acontece
Utilizamos o número da Loteria Federal do país de origem do prêmio.

2. Comparação com os bilhetes vendidos
Se houver um bilhete com o número exato → esse é o ganhador.
Se nenhum tiver o número exato → o sistema identifica o mais próximo em ordem crescente.

3. Critério de desempate
Se dois ou mais bilhetes forem igualmente próximos, vence quem comprou primeiro.

4. Sem repetições
Cada bilhete é único no sistema.
Um número premiado não pode ser repetido em outro sorteio.

✅
Garantia de Justiça
Essa lógica garante:
• Sorteio 100% vinculado à Loteria Federal
• Zero manipulação
• Nenhuma fraude ou favorecimento
• Processo rastreável, seguro e auditável`;

export default function GanhaveisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ---- hooks first (fixed 310)
  const [raffle, setRaffle] = React.useState<RafflePublicMoney | null>(null);
  const [extras, setExtras] = React.useState<Extras | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [qty, setQty] = React.useState(1);

  const lastPaidAgo = useRelativeTime(raffle?.last_paid_at ?? null, "pt-BR");

  // ---- data fetch (money view + base raffle for long content/location)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const { data: r } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,description,image_url,status,ticket_price,draw_date,category_name,subcategory_name,amount_raised,goal_amount,progress_pct_money,last_paid_at")
          .eq("id", id)
          .maybeSingle();

        const { data: base } = await (supabase as any)
          .from("raffles")
          .select("user_id,vendor_url,location_city,location_state,details_html,regulation_html,prize_details,description_long")
          .eq("id", id)
          .maybeSingle();

        if (!alive) return;
        setRaffle((r ?? null) as RafflePublicMoney | null);
        setExtras((base ?? null) as Extras | null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ---- derived
  const pct = Math.max(0, Math.min(100, raffle?.progress_pct_money ?? 0));
  const isActive = raffle?.status === "active";
  const feeFixed = 2;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;
  const drawLabel = raffle?.draw_date ? formatDateBR(raffle.draw_date) : "—";
  const img = raffle?.image_url || "";
  const locationLabel = [extras?.location_city, extras?.location_state].filter(Boolean).join(", ");

  // long text (prefer HTML from DB; else fallback → render as <pre/>)
  const detalhes = extras?.details_html || extras?.description_long || raffle?.description || FALLBACK_DETALHES;
  const regulamento = extras?.regulation_html || FALLBACK_REGULAMENTO;

  // ---- UI helpers
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title: raffle?.title ?? "Ganhavel", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copiado!");
      }
    } catch {
      /* ignore */
    }
  };

  const handleBuy = () => {
    if (!raffle) return;
    navigate(`/ganhavel/${raffle.id}/confirmacao-pagamento?qty=${qty}`);
  };

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Ganhavel não encontrado.</div>;

  return (
    <div className="container mx-auto p-4">
      {/* top line: breadcrumbs / loteria / próxima data */}
      <div className="mb-2 text-xs text-gray-600">
        🇧🇷 Loteria Federal • Próximo sorteio: {drawLabel}
      </div>

      {/* header image + title row */}
      <div className="grid gap-6 md:grid-cols-[1.25fr,0.75fr]">
        <div>
          {img ? (
            <img
              src={img}
              alt={raffle.title}
              className="mb-3 h-64 w-full rounded-2xl object-cover sm:h-80"
            />
          ) : (
            <div className="mb-3 h-64 w-full rounded-2xl bg-gray-100 sm:h-80" />
          )}

          <div className="mb-2 flex flex-wrap items-center gap-2">
            {raffle.category_name && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {raffle.category_name}
              </span>
            )}
            {raffle.subcategory_name && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {raffle.subcategory_name}
              </span>
            )}
            {locationLabel && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                {locationLabel}
              </span>
            )}
            {raffle.status && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                {raffle.status === "active" ? "Ativo" : raffle.status}
              </span>
            )}
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Compartilhar
              </Button>
            </div>
          </div>

          <h1 className="text-2xl font-semibold">{raffle.title}</h1>
          {raffle.description && (
            <p className="mt-1 text-sm text-gray-700">{raffle.description}</p>
          )}

          {/* Tabs: Detalhes / Regulamento */}
          <Tabs defaultValue="detalhes" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="mt-4 space-y-3">
              <h3 className="font-semibold">Detalhes do Prêmio</h3>
              {detalhes?.includes("<") ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: detalhes }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{detalhes}</pre>
              )}
            </TabsContent>

            <TabsContent value="regulamento" className="mt-4 space-y-3">
              <h3 className="font-semibold">Regulamento da Rifa</h3>
              {regulamento?.includes("<") ? (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: regulamento }} />
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800">{regulamento}</pre>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: money/checkout box */}
        <aside className="rounded-2xl border p-4">
          <div className="text-sm text-gray-600">
            {formatBRL(raffle.amount_raised)}{" "}
            <span className="text-gray-400">de</span> {formatBRL(raffle.goal_amount)}
          </div>
          <div className="mt-2">
            <Progress value={pct} className="h-2" />
          </div>
          <div className="mt-2 text-sm text-gray-600">Sorteio: {pct}% completo</div>
          <div className="text-sm text-gray-600">Último pagamento: {lastPaidAgo}</div>

          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500">Bilhete</div>
            <div className="text-lg font-semibold">{formatBRL(raffle.ticket_price)}</div>

            <div className="mt-2 flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQty(q => Math.max(1, q - 1))}>–</Button>
              <span className="w-8 text-center">{qty}</span>
              <Button variant="outline" size="icon" onClick={() => setQty(q => q + 1)}>+</Button>
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

            <Button
              onClick={handleBuy}
              disabled={!isActive}
              className="mt-2 w-full"
            >
              Comprar {qty} {qty > 1 ? "bilhetes" : "bilhete"}
            </Button>

            <p className="text-xs text-gray-500">
              Taxa institucional: R$ 2,00 destinados à instituição financeira
              para processamento e segurança dos pagamentos.
            </p>

            {extras?.vendor_url && (
              <a
                href={extras.vendor_url}
                target="_blank"
                rel="noreferrer"
                className="block text-center text-xs text-emerald-700 underline"
              >
                Compre direto com o vendedor
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}