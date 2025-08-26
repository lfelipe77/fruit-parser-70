import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.53.0?target=deno";

// Optional: Edge runtime types for editor intellisense only
// import * as _mod from "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Initialize Supabase client (service role) - not used for DB writes here, but ensures secrets are wired
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

console.log("🔍 Caixa Probe Function - Testing connectivity to CAIXA API");

serve(withCORS(async (_req: Request) => {
  const url = "https://servicebus2.caixa.gov.br/portaldeloterias/api/home/ultimos-resultados";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
      },
    });

    const text = await res.text();
    const head = text.slice(0, 600);

    return new Response(
      JSON.stringify({
        fetched: url,
        status: res.status,
        contentType: res.headers.get("content-type"),
        head,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
        status: 200,
      },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { headers: { "Content-Type": "application/json" }, status: 500 },
    );
  }
}));
