import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminFedStatus = {
  concurso_number: string | null;
  draw_date: string | null;
  latest_store_updated_at: string | null;
  last_log_at: string | null;
  last_status: string | null;
  last_pick_ok: boolean | null;
  last_header_present: boolean | null;
  last_header_authorized: boolean | null;
};

function dateBR(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString("pt-BR");
}

export default function AdminFederalStatusTile() {
  const [status, setStatus] = useState<AdminFedStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      // Using raw SQL query since the view isn't in types
      const { data, error } = await (supabase as any)
        .from('admin_latest_federal_status')
        .select('*')
        .maybeSingle();
      
      if (error) {
        setErr(error.message);
      } else {
        setStatus(data as AdminFedStatus);
      }
    } catch (e: any) {
      setErr(e?.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const onRefetch = () => load(); // fired by DrawControls after actions
    window.addEventListener("federal:refetch", onRefetch);
    return () => window.removeEventListener("federal:refetch", onRefetch);
  }, []);

  if (err) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-sm text-destructive">Erro: {err}</div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Carregando status federal…</div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Status Federal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-muted-foreground">Concurso:</span>
            <div className="font-mono">{status.concurso_number ?? "-"}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Data do sorteio:</span>
            <div className="font-mono text-xs">{dateBR(status.draw_date)}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Última sync:</span>
            <div className="font-mono text-xs">{dateBR(status.latest_store_updated_at)}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Último log:</span>
            <div className="font-mono text-xs">{dateBR(status.last_log_at)}</div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Último pick ok:</span>
            <div className={`font-mono ${status.last_pick_ok ? 'text-green-600' : 'text-red-600'}`}>
              {String(!!status.last_pick_ok)}
            </div>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Cron header:</span>
            <div className="font-mono text-xs">
              <span className={status.last_header_present ? 'text-green-600' : 'text-red-600'}>
                {String(!!status.last_header_present)}
              </span>
              {" / autorizado: "}
              <span className={status.last_header_authorized ? 'text-green-600' : 'text-red-600'}>
                {String(!!status.last_header_authorized)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}