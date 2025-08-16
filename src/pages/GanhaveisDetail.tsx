import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

type RaffleExtras = {
  user_id: string | null;
  vendor_url: string | null;
  location_city: string | null;
  location_state: string | null;
  details_html: string | null;
  regulation_html: string | null;
  prize_details?: string | null;
  description_long?: string | null;
};

export default function GanhaveisDetail() {
  // ---- hooks first (never conditional)
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [raffle, setRaffle] = React.useState<RafflePublicMoney | null>(null);
  const [extras, setExtras] = React.useState<RaffleExtras | null>(null);
  const [qty, setQty] = React.useState(1);
  const [loading, setLoading] = React.useState(true);

  const lastPaidAgo = useRelativeTime(raffle?.last_paid_at ?? null, "pt-BR");

  // ---- data load
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const [{ data: money }, { data: base }] = await Promise.all([
          (supabase as any)
            .from("raffles_public_money_ext")
            .select(
              "id,title,description,image_url,status,ticket_price,draw_date,category_name,subcategory_name,amount_raised,goal_amount,progress_pct_money,last_paid_at"
            )
            .eq("id", id)
            .maybeSingle(),
          (supabase as any)
            .from("raffles")
            .select(
              "user_id,vendor_url,location_city,location_state,details_html,regulation_html,prize_details,description_long"
            )
            .eq("id", id)
            .maybeSingle(),
        ]);

        if (!alive) return;
        setRaffle((money ?? null) as RafflePublicMoney | null);
        setExtras((base ?? null) as RaffleExtras | null);
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
  const drawLabel = raffle?.draw_date ? formatDateBR(raffle.draw_date) : "—";
  const cityState = [extras?.location_city, extras?.location_state].filter(Boolean).join(", ");
  const feeFixed = 2.0;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;

  // fallbacks from your message (so page isn't empty if DB fields are null)
  const fallbackDetalhes = `
<div class="prose">
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
</div>`.trim();

  const fallbackRegulamento = `
<div class="prose">
  <h3>Regulamento da Rifa</h3>
  <p>🏆 <strong>COMO O GANHADOR É DEFINIDO</strong></p>
  <ol>
    <li><strong>Sorteio acontece</strong><br/>Utilizamos o número da Loteria Federal do país de origem do prêmio.</li>
    <li><strong>Comparação com os bilhetes vendidos</strong><br/>Se houver um bilhete com o número exato → esse é o ganhador.<br/>Se nenhum tiver o número exato → vale o mais próximo em ordem crescente.</li>
    <li><strong>Critério de desempate</strong><br/>Em caso de empate, vence quem comprou primeiro.</li>
    <li><strong>Sem repetições</strong><br/>Cada bilhete é único. Um número premiado não se repete em outro sorteio.</li>
  </ol>
  <p>✅ <strong>Garantia de Justiça</strong></p>
  <ul>
    <li>Sorteio 100% vinculado à Loteria Federal</li>
    <li>Zero manipulação</li>
    <li>Nenhuma fraude ou favorecimento</li>
    <li>Processo rastreável, seguro e auditável</li>
  </ul>
</div>`.trim();

  const htmlDetalhes =
    extras?.details_html || extras?.description_long || raffle?.description || fallbackDetalhes;
  const htmlReg = extras?.regulation_html || fallbackRegulamento;

  // ---- actions
  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: raffle?.title ?? "Ganhavel", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      // you can swap for your toast
      alert("Link copiado!");
    }
  };

  const handleBuy = () => {
    if (!raffle) return;
    navigate(`/ganhavel/${raffle.id}/confirmacao-pagamento?qty=${qty}`);
  };

  // ---- render
  if (loading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Ganhavel não encontrado.</div>;

  return (
    <div className="container mx-auto p-4">
      {/* top breadcrumbs / chips */}
      <div className="mb-2 text-xs text-gray-600">
        🇧🇷 Loteria Federal • Próximo sorteio: {drawLabel}
      </div>

      {/* hero + right money box */}
      <div className="grid gap-6 md:grid-cols-[1fr,360px]">
        <div>
          {/* hero image */}
          <div className="rounded-2xl overflow-hidden border">
            <img
              src={raffle.image_url || "/placeholder.png"}
              alt={raffle.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>

          {/* chips + share + call-to-action row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
            <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs">
              Ativo
            </span>

            <div className="ml-auto flex gap-2">
              <button onClick={handleShare} className="rounded-xl border px-3 py-1.5 text-sm">
                Compartilhar
              </button>
              <button
                onClick={handleBuy}
                className="rounded-xl bg-emerald-500 px-3 py-1.5 text-sm text-white"
              >
                Faça o sonho acontecer
              </button>
            </div>
          </div>

          {/* title + optional location */}
          <h1 className="mt-3 text-2xl font-semibold">{raffle.title}</h1>
          {cityState && <div className="text-sm text-gray-500">{cityState}</div>}

          {/* tabs */}
          <Tabs defaultValue="detalhes" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="mt-4">
              <div
                className="prose max-w-none text-sm text-gray-800"
                dangerouslySetInnerHTML={{ __html: htmlDetalhes }}
              />
            </TabsContent>

            <TabsContent value="regulamento" className="mt-4">
              <div
                className="prose max-w-none text-sm text-gray-800"
                dangerouslySetInnerHTML={{ __html: htmlReg }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* right money box */}
        <aside className="rounded-2xl border p-4">
          <div className="text-sm text-gray-600">
            {formatBRL(raffle.amount_raised)} <span className="text-gray-400">de</span>{" "}
            {formatBRL(raffle.goal_amount)}
          </div>
          <div className="mt-2">
            <Progress value={pct} className="h-2" />
          </div>
          <div className="mt-2 text-sm text-gray-600">Sorteio: {pct}% completo</div>
          <div className="text-sm text-gray-600">Último pagamento: {lastPaidAgo}</div>

          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500">Bilhete</div>
            <div className="text-lg font-semibold">{formatBRL(raffle.ticket_price)}</div>

            <div className="mt-1 flex items-center gap-2">
              <button
                className="rounded border px-2 py-1"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                –
              </button>
              <span className="w-8 text-center">{qty}</span>
              <button className="rounded border px-2 py-1" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>

            <div className="flex justify-between text-sm">
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
              Taxa institucional: R$ 2,00 destinados à instituição financeira para processamento e
              segurança dos pagamentos.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}