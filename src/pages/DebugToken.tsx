import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DebugToken() {
  // Hard gate in case route is accidentally enabled
  if (import.meta.env.MODE === "production") return null;

  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) setErr(error.message);
      setToken(data?.session?.access_token || "");
      setLoading(false);
      // Also log to console for quick inspection
      console.log("/debug-token session", { data, error });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token || "");
      toast.success("Token copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy");
    }
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Access Token (Dev)</h1>
        <p className="text-sm text-muted-foreground">
          This token expires quickly — only use for testing.
        </p>
        {loading ? (
          <div className="text-sm">Loading session…</div>
        ) : err ? (
          <div className="text-sm text-destructive">{err}</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={copy} disabled={!token}>
                Copy token
              </Button>
            </div>
            <pre className="whitespace-pre-wrap break-all rounded-md border bg-muted p-3 text-xs">
              {token || "<no token>"}
            </pre>
          </div>
        )}
      </section>
    </main>
  );
}
