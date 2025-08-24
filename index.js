export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);

    // CORS headers
    const cors = {
      "Access-Control-Allow-Origin": "https://ganhavel.com",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret, x-asaas-token",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      "Cache-Control": "no-store",
    };

    // CORS preflight
    if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 200, headers: cors });
    }

    // GET /api/ping
    if (req.method === "GET" && url.pathname === "/api/ping") {
      return new Response(JSON.stringify({ ok: true, from: "ganhavel.com", ts: Math.floor(Date.now()/1000) }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8", ...cors },
      });
    }

    // Proxy webhook
    const isWebhook = ["/api/asaas/webhook", "/api/asaas-webhook"].includes(url.pathname);
    if (isWebhook) {
      if (req.method !== "POST") {
        return new Response(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
          status: 405,
          headers: { "content-type": "application/json; charset=utf-8", ...cors },
        });
      }

      const upstream = "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/asaas-webhook";
      const proxied = await fetch(upstream, {
        method: "POST",
        headers: req.headers,
        body: req.body,
        redirect: "manual",
      });

      const resp = new Response(proxied.body, { status: proxied.status });
      for (const [k, v] of Object.entries(cors)) resp.headers.set(k, v);
      resp.headers.set("content-type", proxied.headers.get("content-type") || "application/json; charset=utf-8");
      return resp;
    }

    // Fallback
    return new Response("Not Found", { status: 404 });
  }
};
