export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = "https://ganhavel.com";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-webhook-secret, x-asaas-token",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      "Cache-Control": "no-store",
    };

    // CORS preflight for /api/*
    if (req.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 200, headers: cors });
    }

    // Health
    if (req.method === "GET" && url.pathname === "/api/ping") {
      return new Response(
        JSON.stringify({ ok: true, from: "ganhavel.com", ts: Math.floor(Date.now() / 1000) }),
        {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8", ...cors },
        }
      );
    }

    // Webhook proxy
    const isWebhook =
      url.pathname === "/api/asaas/webhook" ||
      url.pathname === "/api/asaas-webhook";

    if (isWebhook) {
      if (req.method !== "POST") {
        return new Response(
          JSON.stringify({ ok: false, error: "Method Not Allowed" }),
          {
            status: 405,
            headers: { "content-type": "application/json; charset=utf-8", ...cors },
          }
        );
      }

      const upstream =
        "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/asaas-webhook" +
        url.search;
      const headers = new Headers(req.headers); // forward all headers
      if (!headers.get("content-type")) headers.set("content-type", "application/json");

      const upstreamRes = await fetch(upstream, {
        method: "POST",
        headers,
        body: req.body, // stream as-is
        redirect: "manual",
      });

      const resp = new Response(upstreamRes.body, { status: upstreamRes.status });
      const ct =
        upstreamRes.headers.get("content-type") ||
        "application/json; charset=utf-8";
      resp.headers.set("content-type", ct);
      for (const [k, v] of Object.entries(cors)) resp.headers.set(k, v);
      return resp;
    }

    // Fall through: let SPA serve the rest
    return fetch(req);
  },
};
