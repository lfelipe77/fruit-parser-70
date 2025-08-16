import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/formatters";

export default function ConfirmacaoPagamento() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const qty = Math.max(1, Number(new URLSearchParams(location.search).get("qty") ?? "1"));
  const [loading, setLoading] = React.useState(true);
  const [row, setRow] = React.useState<any>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,image_url,ticket_price")
          .eq("id", id)
          .maybeSingle();
        if (!alive) return;
        setRow(data ?? null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!row) return <div className="p-6">Rifa não encontrada.</div>;

  const fee = 2;
  const subtotal = (row.ticket_price ?? 0) * qty;
  const total = subtotal + fee;

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-semibold">Confirmação de Pagamento</h1>

      <div className="grid gap-6 md:grid-cols-[1fr,360px]">
        <div className="rounded-2xl border p-4">
          <div className="flex gap-4">
            <img
              src={row.image_url || "https://placehold.co/640x360?text=Imagem"}
              className="h-24 w-40 rounded object-cover"
              alt={row.title}
            />
            <div>
              <h2 className="font-semibold">{row.title}</h2>
              <p className="text-sm text-gray-600">Quantidade: {qty}</p>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Bilhetes ({qty}x)</span><span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Taxa institucional</span><span>{formatBRL(fee)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span><span>{formatBRL(total)}</span>
          </div>
          <button className="mt-2 w-full rounded-xl bg-emerald-600 py-2 text-white"
            onClick={() => {/* start Asaas flow here */}}>
            Continuar para pagamento (Asaas)
          </button>
          <button className="w-full rounded-xl border py-2"
            onClick={() => navigate(`/ganhavel/${id}`)}>
            Voltar para a rifa
          </button>
        </aside>
      </div>
    </div>
  );
}