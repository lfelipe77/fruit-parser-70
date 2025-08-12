import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string | null;
  context: any | null;
  created_at: string | null;
}

export default function AuditLogs() {
  const [limit, setLimit] = useState<number>(100);
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)("get_audit_logs_recent", {
        p_limit: Math.max(1, Math.min(1000, limit)),
      });

      if (error) {
        const msg = String(error?.message || "Erro ao buscar logs");
        if (msg.toLowerCase().includes("admin only") || msg.toLowerCase().includes("access denied")) {
          toast({ title: "Acesso negado", description: "Você deve ser admin para ver os logs de auditoria.", variant: "destructive" });
        } else {
          toast({ title: "Erro", description: msg, variant: "destructive" });
        }
        return;
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const msg = String(err?.message || err || "Erro inesperado");
      if (msg.toLowerCase().includes("admin only") || msg.toLowerCase().includes("access denied")) {
        toast({ title: "Acesso negado", description: "Você deve ser admin para ver os logs de auditoria.", variant: "destructive" });
      } else {
        toast({ title: "Erro", description: msg, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const onAdminPing = async () => {
    setPingLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)("admin_ping");
      if (error) {
        throw error;
      }
      toast({ title: "Sucesso", description: String(data ?? "ok") });
    } catch (err: any) {
      const msg = String(err?.message || err || "Erro inesperado");
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setPingLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExportCsv = () => {
    if (!rows?.length) return;
    const header = ["id", "action", "user_id", "created_at", "context"];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) => {
          const contextStr = JSON.stringify(r.context ?? {});
          const cols = [r.id, r.action ?? "", r.user_id ?? "", r.created_at ?? "", contextStr];
          return cols
            .map((c) => {
              const s = String(c ?? "");
              // wrap in quotes and escape existing quotes
              return `"${s.replace(/"/g, '""')}"`;
            })
            .join(",");
        })
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Audit Logs (Admin)</h1>
          <p className="text-sm text-muted-foreground">Verifique e pesquise eventos recentes de auditoria.</p>
        </div>
        <Button size="sm" onClick={onAdminPing} disabled={pingLoading}>
          {pingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          Admin Ping
        </Button>
      </header>

      <section aria-label="Filtros" className="flex items-end gap-3">
        <div className="grid gap-1">
          <label htmlFor="limit" className="text-sm font-medium">
            Limit
          </label>
          <Input
            id="limit"
            type="number"
            min={1}
            max={1000}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-32"
          />
        </div>
        <Button onClick={fetchLogs} disabled={loading}>
          {loading ? "Carregando..." : "Buscar"}
        </Button>
        <Button variant="outline" onClick={onExportCsv} disabled={!rows.length}>
          Exportar CSV
        </Button>
      </section>

      <section aria-label="Resultados" className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Evento</TableHead>
              <TableHead>Actor ID</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Contexto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {loading ? "Carregando..." : "Sem resultados"}
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.id}</TableCell>
                <TableCell>{r.action ?? ""}</TableCell>
                <TableCell className="font-mono text-xs">{r.user_id ?? "anon"}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                </TableCell>
                <TableCell>
                  <ContextCell value={r.context} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </main>
  );
}

function ContextCell({ value }: { value: any }) {
  const [open, setOpen] = useState(false);
  const preview = useMemo(() => {
    try {
      const str = JSON.stringify(value ?? {}, null, open ? 2 : 0);
      return open ? str : (str.length > 120 ? str.slice(0, 120) + "…" : str);
    } catch {
      const s = String(value ?? "");
      return open ? s : (s.length > 120 ? s.slice(0, 120) + "…" : s);
    }
  }, [value, open]);

  return (
    <div className="max-w-[520px]">
      <pre className="text-xs whitespace-pre-wrap break-words">{preview}</pre>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-primary underline"
      >
        {open ? "Mostrar menos" : "Expandir"}
      </button>
    </div>
  );
}
