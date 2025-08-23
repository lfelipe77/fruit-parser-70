// Cloudflare Pages Function to ensure API proxying happens before SPA fallback
// Handles CORS preflight, diagnostic ping, and reverse-proxy to Supabase Edge Function

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  const allowOrigin = "https://ganhavel.com";
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
  } as const;

  const isAsaasWebhookPath =
    url.pathname === "/api/asaas/webhook" || url.pathname === "/api/asaas-webhook";

  // 1) CORS preflight for API paths
  if (method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // 2) Diagnostic ping (prove non-SPA handling)
  if (method === "GET" && url.pathname === "/api/ping") {
    const body = JSON.stringify({ ok: true, from: "ganhavel.com", ts: Math.floor(Date.now() / 1000) });
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  // 3) Asaas webhook proxying
  if (isAsaasWebhookPath) {
    // Method guard: only POST is allowed
    if (method !== "POST") {
      const body = JSON.stringify({ error: "Method Not Allowed" });
      return new Response(body, {
        status: 405,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": allowOrigin,
          "Cache-Control": "no-store",
        },
      });
    }

    const upstream = "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/asaas-webhook";

    // Stream request body and forward all headers as-is
    const proxied = await fetch(upstream, {
      method: "POST",
      body: request.body,
      headers: request.headers,
      redirect: "manual",
    });

    // Pass-through response while enforcing CORS + no-store
    const headers = new Headers(proxied.headers);
    headers.set("Access-Control-Allow-Origin", allowOrigin);
    headers.set("Cache-Control", "no-store");

    return new Response(proxied.body, {
      status: proxied.status,
      statusText: proxied.statusText,
      headers,
    });
  }

  // 4) Fallthrough to SPA/static for everything else
  return context.next();
}
