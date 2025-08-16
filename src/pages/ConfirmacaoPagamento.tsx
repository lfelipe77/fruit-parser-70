import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";

type MoneyRow = { id: string; title: string; image_url: string | null; ticket_price: number; };

export default function ConfirmacaoPagamento() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const qty = Math.max(1, Number(new URLSearchParams(location.search).get("qty") ?? "1"));
  const [row, setRow] = React.useState<MoneyRow | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,image_url,ticket_price")
          .eq("id", id).maybeSingle();
        if (!alive) return;
        setRow((data ?? null) as MoneyRow | null);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="p-6">Carregando…</div>;
  if (!row) return <div className="p-6">Rifa não encontrada.</div>;

  const subtotal = row.ticket_price * qty;
  const fee = 2;
  const total = subtotal + fee;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center gap-3">
        {row.image_url ? <img src={row.image_url} alt={row.title} className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-gray-100" />}
        <div>
          <h1 className="text-xl font-semibold">Confirmar compra</h1>
          <div className="text-gray-600">{row.title}</div>
        </div>
      </div>

      <div className="max-w-md space-y-2 rounded-2xl border p-4">
        <div className="flex justify-between"><span>Bilhetes ({qty}x)</span><span>{formatBRL(subtotal)}</span></div>
        <div className="flex justify-between text-gray-600"><span>Taxa institucional</span><span>{formatBRL(fee)}</span></div>
        <div className="flex justify-between font-semibold text-emerald-700"><span>Total</span><span>{formatBRL(total)}</span></div>
        <div className="mt-3 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => navigate(`/ganhavel/${id}`)}>Voltar</Button>
          <Button className="flex-1" onClick={() => navigate(`/ganhavel/${id}`)}>Pagar com Asaas</Button>
        </div>
      </div>
    </div>
  );
}