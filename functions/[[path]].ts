export const onRequest: PagesFunction = async (ctx) => {
  const { request } = ctx;
  const url = new URL(request.url);
  const origin = "https://ganhavel.com";

  const cors = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret, x-asaas-token",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
  };

  const json = (obj: any, status = 200, extra: Record<string, string> = {}) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { "content-type": "application/json; charset=utf-8", ...cors, ...extra },
    });

  // CORS preflight
  if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
    return new Response(null, { status: 200, headers: cors as any });
  }

  // Health
  if (request.method === "GET" && url.pathname === "/api/ping") {
    return json({ ok: true, from: "ganhavel.com", ts: Math.floor(Date.now() / 1000) });
  }

  // Webhook proxy
  const isWebhook =
    url.pathname === "/api/asaas/webhook" ||
    url.pathname === "/api/asaas-webhook";

  if (isWebhook) {
    if (request.method !== "POST") {
      return json({ ok: false, error: "Method Not Allowed" }, 405);
    }

    const upstream = "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/asaas-webhook";
    const headers = new Headers(request.headers);
    if (!headers.get("content-type")) headers.set("content-type", "application/json");

    const upstreamRes = await fetch(upstream + url.search, {
      method: "POST",
      headers,
      body: request.body,        // stream as-is
      redirect: "manual",
    });

    // pass-through body + status; add CORS + no-store
    const proxied = new Response(upstreamRes.body, { status: upstreamRes.status });
    const ct = upstreamRes.headers.get("content-type") || "application/json; charset=utf-8";
    proxied.headers.set("content-type", ct);
    for (const [k, v] of Object.entries(cors)) proxied.headers.set(k, v as string);
    return proxied;
  }

  // SPA fallback
  return ctx.next();
};
