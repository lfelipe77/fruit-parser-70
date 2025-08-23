export const onRequest: PagesFunction = async (ctx) => {
  const { request, env } = ctx;
  const url = new URL(request.url);
  const path = url.pathname;

  const cors = {
    "Access-Control-Allow-Origin": "https://ganhavel.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret, x-asaas-token",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
  };

  // 1) CORS preflight for /api/*
  if (request.method === "OPTIONS" && path.startsWith("/api/")) {
    return new Response(null, { status: 200, headers: cors as any });
  }

  // 2) Ping: return JSON (NOT HTML)
  if (request.method === "GET" && path === "/api/ping") {
    const body = JSON.stringify({
      ok: true,
      from: "ganhavel.com",
      ts: Math.floor(Date.now() / 1000),
    });
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", ...cors },
    });
  }

  // 3) Webhook proxy (POST only)
  const isWebhook =
    path === "/api/asaas/webhook" || path === "/api/asaas-webhook";

  if (isWebhook) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
        status: 405,
        headers: { "content-type": "application/json; charset=utf-8", ...cors },
      });
    }

    const upstream = "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/asaas-webhook";

    // Forward headers and body as-is; DO NOT strip x-webhook-secret / Authorization
    const fwdHeaders = new Headers(request.headers);
    // Ensure JSON content-type if missing (Asaas always sends JSON)
    if (!fwdHeaders.get("content-type")) {
      fwdHeaders.set("content-type", "application/json");
    }

    const resp = await fetch(upstream + url.search, {
      method: "POST",
      headers: fwdHeaders,
      body: request.body,
      redirect: "manual",
    });

    const respHeaders = new Headers(resp.headers);
    respHeaders.set("content-type", resp.headers.get("content-type") || "application/json; charset=utf-8");
    for (const [k, v] of Object.entries(cors)) respHeaders.set(k, v);

    return new Response(resp.body, { status: resp.status, headers: respHeaders });
  }

  // 4) Fall back to SPA for anything else
  return ctx.next();
};
