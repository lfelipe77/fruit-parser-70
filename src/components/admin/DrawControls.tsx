import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

export default function DrawControls() {
  const [busy, setBusy] = useState<null | "sync" | "pick">(null);
  const [msg, setMsg] = useState("");
  const [lastSync, setLastSync] = useState<{ updated_at?: string | null; concurso?: string | null; draw_date?: string | null } | null>(null);
  const [lastPick, setLastPick] = useState<{ picked_at?: string | null; concurso?: string | null; draw_date?: string | null; winning_key?: string | null } | null>(null);

  async function fetchStatus() {
    try {
      const [fdRes, pickRes] = await Promise.all([
        supabase
          .from("federal_draws")
          .select("concurso_number, draw_date, updated_at")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("raffle_winner_logs")
          .select("concurso_number, draw_date, picked_at, winning_key")
          .order("picked_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!fdRes.error) {
        setLastSync({
          concurso: (fdRes.data as any)?.concurso_number ?? null,
          draw_date: (fdRes.data as any)?.draw_date ?? null,
          updated_at: (fdRes.data as any)?.updated_at ?? null,
        });
      }
      if (!pickRes.error) {
        setLastPick({
          concurso: (pickRes.data as any)?.concurso_number ?? null,
          draw_date: (pickRes.data as any)?.draw_date ?? null,
          picked_at: (pickRes.data as any)?.picked_at ?? null,
          winning_key: (pickRes.data as any)?.winning_key ?? null,
        });
      }
    } catch (e) {
      // swallow
    }
  }

  useEffect(() => {
    fetchStatus();
    const handler = () => fetchStatus();
    window.addEventListener("federal:refetch", handler);
    return () => window.removeEventListener("federal:refetch", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncLatest() {
    try {
      setBusy("sync");
      setMsg("Sincronizando com a Loteria Federal…");
      const { data, error } = await supabase.functions.invoke("federal-sync", {
        body: { trigger: "admin_manual" },
      });
      if (error) throw error;
      // data format may vary by function; treat success when no error
      setMsg("Sincronização concluída.");
      window.dispatchEvent(new CustomEvent("federal:refetch"));
      fetchStatus();
    } catch (e: any) {
      setMsg(`Erro: ${e?.message || String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  async function pickWinners() {
    try {
      setBusy("pick");
      setMsg("Calculando e confirmando o ganhador…");
      const { data, error } = await supabase.rpc("pick_winners_from_latest_federal");
      if (error) throw error;
      if (data && (data as any).ok === false) {
        throw new Error((data as any).reason || (data as any).error || "Falha ao escolher vencedor");
      }
      setMsg("Ganhador confirmado!");
      window.dispatchEvent(new CustomEvent("federal:refetch"));
      fetchStatus();
    } catch (e: any) {
      setMsg(`Erro: ${e?.message || String(e)}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Loteria Federal — Controles</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={syncLatest} disabled={busy !== null}>
            {busy === "sync" ? "Sincronizando…" : "Sincronizar agora"}
          </Button>
          <Button onClick={pickWinners} disabled={busy !== null} variant="secondary">
            {busy === "pick" ? "Calculando…" : "Escolher vencedor agora"}
          </Button>
          <span className="text-sm text-muted-foreground">{msg}</span>
        </div>
        <div className="mt-3 text-xs text-muted-foreground flex flex-wrap gap-4">
          <div>
            Última sincronização: <span className="font-medium">{timeAgo(lastSync?.updated_at)}</span>
            {lastSync?.concurso ? (
              <span className="ml-2 opacity-80">concurso {lastSync.concurso}</span>
            ) : null}
          </div>
          <div>
            Última escolha: <span className="font-medium">{timeAgo((lastPick as any)?.picked_at)}</span>
            {lastPick?.winning_key ? (
              <span className="ml-2 opacity-80">chave {lastPick.winning_key}</span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
