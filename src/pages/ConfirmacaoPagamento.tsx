import * as React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/formatters";

type MoneyRow = { id: string; title: string; image_url: string | null; ticket_price: number };

export default function ConfirmacaoPagamento() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

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
          .eq("id", id)
          .maybeSingle();
        if (!alive) return;
        setRow((data ?? null) as MoneyRow | null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading || !row) return <div className="p-6">Carregando…</div>;

  const subtotal = row.ticket_price * qty;
  const fee = 2;
  const total = subtotal + fee;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-lg rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <img
            src={row.image_url || "/placeholder.png"}
            alt={row.title}
            className="h-10 w-10 rounded object-cover"
          />
          <div>
            <div className="font-medium">Confirmar compra</div>
            <div className="text-sm text-gray-600">{row.title}</div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Bilhetes ({qty}x)</span>
            <span>{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxa institucional</span>
            <span>{formatBRL(fee)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={() => navigate(`/ganhavel/${row.id}`)} className="rounded-xl border px-4 py-2">
            Voltar
          </button>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-white">
            Pagar com Asaas
          </button>
        </div>
      </div>
    </div>
  );
}