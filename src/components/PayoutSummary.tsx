import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/money";

export function PayoutSummary({ raffleId, amountCollected }: { raffleId: string; amountCollected: number }) {
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const gross = amountCollected;
  const commission = Math.round(gross * 0.02 * 100) / 100;
  const net = gross - commission;

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) return;

      const { data: prof } = await supabase.from("user_profiles").select("role").eq("id", uid).maybeSingle();
      const { data: raff } = await supabase.from("raffles").select("owner_user_id").eq("id", raffleId).maybeSingle();

      const ok = prof?.role === 'admin' || raff?.owner_user_id === uid;
      setIsOwnerOrAdmin(ok);
    })();
  }, [raffleId]);

  async function finalize() {
    try {
      setBusy(true);
      const { error } = await supabase.rpc("finalize_payout", { p_raffle_id: raffleId });
      if (error) throw error;
      alert("Payout criado.");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Erro ao finalizar payout.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOwnerOrAdmin) return null;

  return (
    <div className="p-3 rounded-lg border grid gap-1">
      <div className="text-sm text-muted-foreground">Resumo Financeiro</div>
      <div className="text-sm">Bruto: <b>{brl(gross)}</b></div>
      <div className="text-sm">Comissão (2%): <b>{brl(commission)}</b></div>
      <div className="text-sm">Líquido: <b>{brl(net)}</b></div>
      <div className="mt-2">
        <button
          onClick={finalize}
          disabled={busy || gross <= 0}
          className="px-3 py-1 rounded bg-primary text-primary-foreground text-sm disabled:opacity-60"
        >
          {busy ? "Processando…" : "Finalizar Payout"}
        </button>
      </div>
    </div>
  );
}