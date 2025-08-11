import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(withCORS(async (req: Request) => {
  // extract info
  const url = new URL(req.url);
  const visitUrl = url.searchParams.get("p") || url.pathname; // we pass the path via ?p=
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const ua = req.headers.get("user-agent") || null;

  // supabase (service role)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // fire-and-forget style (but we await to catch errors)
  const { error } = await supabase.rpc("log_public_visit", {
    visit_url: visitUrl,        // RPC expects visit_url (we store both url + sanitized pathname)
    visit_ip: ip,
    visit_user_agent: ua,
    visit_user_id: null,
    dedup_minutes: 10
  });

  if (error) {
    // still no body; surface as server error
    return new Response(null, { status: 500, headers: { "Cache-Control": "no-store" } });
  }

  // success: 204 no-content
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}));
