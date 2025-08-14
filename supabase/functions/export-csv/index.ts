import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Minimal CSV helper
function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.map(esc).join(",");
  const body = rows.map((r) => headers.map((h) => esc((r as any)[h])).join(",")).join("\n");
  return head + "\n" + body;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const search = Object.fromEntries(url.searchParams.entries());

    if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405 });

    if (path.endsWith("/transactions")) {
      // Filters: ganhavel_id (optional), status (optional: paid/pending)
      const ganhavel_id = search.ganhavel_id;
      const status = search.status;
      let q = supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (ganhavel_id) q = q.eq("ganhavel_id", ganhavel_id);
      if (status) q = q.eq("status", status);

      const { data, error } = await q.limit(5000); // cap to keep response small
      if (error) throw error;

      const csv = toCSV(data || []);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="transactions.csv"`,
          ...corsHeaders,
        },
      });
    }

    if (path.endsWith("/payouts")) {
      const raffle_id = search.raffle_id;
      let q = supabase.from("payouts").select("*").order("created_at", { ascending: false });
      if (raffle_id) q = q.eq("raffle_id", raffle_id);

      const { data, error } = await q.limit(5000);
      if (error) throw error;

      const csv = toCSV(data || []);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="payouts.csv"`,
          ...corsHeaders,
        },
      });
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response("Internal Error", { status: 500, headers: corsHeaders });
  }
});