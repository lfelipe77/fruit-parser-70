import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

function dateTimeBR(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "-"
    : d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

export default function AdminFederalStatusTile() {
  const [status, setStatus] = useState<AdminFedStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    const { data, error } = await (supabase as any).rpc("get_admin_latest_federal_status");
    if (error) setErr(error.message);
    setStatus((data as AdminFedStatus) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const onRefetch = () => load(); // fired by DrawControls after actions
    window.addEventListener("federal:refetch", onRefetch);
    return () => window.removeEventListener("federal:refetch", onRefetch);
  }, []);

  if (err) return <div className="mt-4 text-sm text-red-600">Erro: {err}</div>;
  if (loading) return <div className="mt-4 text-sm opacity-70">Carregando status…</div>;
  if (!status) return null;

  return (
    <div className="mt-4 rounded-xl border bg-white p-4 text-sm">
      <div><b>Concurso:</b> {status.concurso_number ?? "-"}</div>
      <div><b>Data do sorteio:</b> {dateTimeBR(status.draw_date)}</div>
      <div><b>Última sync:</b> {dateTimeBR(status.latest_store_updated_at)}</div>
      <div><b>Último log:</b> {dateTimeBR(status.last_log_at)}</div>
      <div><b>Status:</b> {status.last_status ?? "-"}</div>
      <div><b>Último pick ok:</b> {String(!!status.last_pick_ok)}</div>
      <div><b>Cron header:</b> {String(!!status.last_header_present)} / autorizado: {String(!!status.last_header_authorized)}</div>
    </div>
  );
}
