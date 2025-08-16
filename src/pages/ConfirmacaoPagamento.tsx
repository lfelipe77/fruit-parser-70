import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatBRL } from "@/lib/formatters";
import type { RafflePublicMoney } from "@/types/public-views";
import Navigation from "@/components/Navigation";

export default function ConfirmacaoPagamento() {
  const { id, ganhaveisId } = useParams<{ id?: string; ganhaveisId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ---- All hooks first (unconditionally)
  const actualId = id || ganhaveisId;
  const qty = Math.max(1, Number(new URLSearchParams(location.search).get("qty") ?? "1"));
  const [loading, setLoading] = React.useState(true);
  const [raffle, setRaffle] = React.useState<RafflePublicMoney | null>(null);

  // ---- Data loading
  React.useEffect(() => {
    if (!actualId) {
      setLoading(false);
      return;
    }
    
    let alive = true;
    
    const fetchRaffle = async () => {
      try {
        setLoading(true);
        
        const { data: r } = await (supabase as any)
          .from("raffles_public_money_ext")
          .select("id,title,ticket_price,image_url,amount_raised,goal_amount,progress_pct_money")
          .eq("id", actualId)
          .maybeSingle();
        
        if (!alive) return;
        setRaffle(r);
      } catch (error) {
        console.error('Error fetching raffle:', error);
        if (alive) {
          setRaffle(null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchRaffle();
    
    return () => {
      alive = false;
    };
  }, [actualId]);

  // ---- Derived values
  const feeFixed = 2.0;
  const subtotal = (raffle?.ticket_price ?? 0) * qty;
  const total = subtotal + feeFixed;

  const handleConfirmPayment = async () => {
    if (!raffle || !actualId) return;
    
    try {
      // Mock transaction creation for now
      console.log('Creating transaction:', { actualId, qty, total });
      
      // Navigate to success page
      navigate(`/ganhavel/${actualId}/pagamento-sucesso`);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
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
        <div className="p-6">Rifa não encontrada.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Confirmar Pagamento</h1>
        
        <div className="max-w-md mx-auto space-y-4">
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold">{raffle.title}</h2>
            <p className="text-sm text-gray-600">Quantidade: {qty} bilhetes</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Bilhetes ({qty}x):</span>
              <span>{formatBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxa institucional:</span>
              <span>{formatBRL(feeFixed)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total a pagar</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>

          <button
            onClick={handleConfirmPayment}
            className="w-full rounded-xl bg-emerald-500 py-3 text-white font-semibold"
          >
            Confirmar Pagamento
          </button>

          <button
            onClick={() => navigate(`/ganhavel/${actualId}`)}
            className="w-full rounded-xl border py-3 text-gray-700"
          >
            Voltar aos Detalhes
          </button>
        </div>
      </div>
    </div>
  );
}