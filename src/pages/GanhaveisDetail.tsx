import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatBRL, formatDateBR } from "@/lib/formatters";
import { useRelativeTime } from "@/hooks/useRelativeTime";

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

function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = React.useState(false);
  const doShare = async () => {
    try {
      if ((navigator as any).share) {
        await (navigator as any).share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };
  return (
    <button onClick={doShare} className="rounded-lg border px-3 py-1 text-sm">
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}

export default function GanhaveisDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ---- Hooks (always first)
  const [raffle, setRaffle] = React.useState<RafflePublicMoney | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [qty, setQty] = React.useState(1);

  const lastPaidAgo = useRelativeTime(raffle?.last_paid_at ?? null, "pt-BR");

  // ---- Data load
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data: r, error } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,description,image_url,status,ticket_price,draw_date,category_name,subcategory_name,amount_raised,goal_amount,progress_pct_money,last_paid_at")
          .eq("id", id)
          .maybeSingle();
        if (error) console.warn("money view error", error);
        if (!alive) return;
        setRaffle((r ?? null) as RafflePublicMoney | null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // ---- Derived
  const pct = Math.max(0, Math.min(100, raffle?.progress_pct_money ?? 0));
  const drawLabel = raffle?.draw_date ? formatDateBR(raffle.draw_date) : "—";
  const isActive = raffle?.status === "active";
  const feeFixed = 2;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;

  // ---- Render
  if (loading) return <div className="p-6">Carregando…</div>;
  if (!raffle) return <div className="p-6">Ganhavel não encontrado.</div>;

  const pageUrl = `${location.origin}/#/ganhavel/${raffle.id}`;

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600">
          🇧🇷 Loteria Federal • Próximo sorteio: {drawLabel}
        </div>
        <ShareButton title={raffle.title} url={pageUrl} />
      </div>

      {/* Image + Title */}
      <div className="grid gap-6 md:grid-cols-[1fr,360px]">
        <div>
          <div className="overflow-hidden rounded-2xl border bg-white">
            <img
              src={raffle.image_url || "https://placehold.co/1200x675?text=Imagem+indispon%C3%ADvel"}
              alt={raffle.title}
              className="h-auto w-full object-cover"
            />
          </div>

          <h1 className="mt-4 text-2xl font-semibold">{raffle.title}</h1>
          {raffle.description && (
            <p className="mt-2 text-gray-700">{raffle.description}</p>
          )}

          {/* Tabs */}
          <Tabs defaultValue="detalhes" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
              <TabsTrigger value="regulamento">Regulamento</TabsTrigger>
            </TabsList>

            <TabsContent value="detalhes" className="prose mt-4 max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: FALLBACK_DETAILS }}
              />
            </TabsContent>

            <TabsContent value="regulamento" className="prose mt-4 max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: FALLBACK_RULES }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: money box */}
        <aside className="rounded-2xl border p-4">
          <div className="text-sm text-gray-600">
            {formatBRL(raffle.amount_raised)} <span className="text-gray-400">de</span> {formatBRL(raffle.goal_amount)}
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
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="rounded border px-2 py-1">–</button>
              <span className="w-8 text-center">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="rounded border px-2 py-1">+</button>
            </div>

            <div className="mt-2 flex justify-between text-sm">
              <span>Bilhetes ({qty}x):</span><span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa institucional:</span><span>{formatBRL(feeFixed)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total a pagar</span><span>{formatBRL(total)}</span>
            </div>

            <button
              onClick={() => navigate(`/ganhavel/${raffle.id}/confirmacao-pagamento?qty=${qty}`)}
              disabled={!isActive}
              className="mt-2 w-full rounded-xl bg-emerald-500 py-2 text-white disabled:opacity-50"
            >
              Comprar {qty} bilhetes
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}