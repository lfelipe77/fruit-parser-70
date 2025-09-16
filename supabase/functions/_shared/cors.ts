// supabase/functions/_shared/cors.ts

type Handler = (req: Request) => Promise<Response> | Response;

function parseAllowed(): string[] {
  const raw = Deno.env.get("EDGE_ALLOW_ORIGINS") ?? Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return raw.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
}

function wildcardMatch(rule: string, origin: string): boolean {
  // supports rules like: https://*.lovable.app (https only)
  if (!rule.startsWith("https://*.")) return false;
  const root = rule.slice("https://*.".length); // "lovable.app"
  return origin.startsWith("https://") && origin.endsWith("." + root);
}

function isAllowedOrigin(originHeader: string | null, allowed: string[]): boolean {
  if (!originHeader) return true;              // non-browser/server-to-server
  if (allowed.length === 0) return true;       // preview/dev: allow all
  const origin = originHeader.toLowerCase();
  
  // Always allow production domains
  const productionDomains = ['https://ganhavel.com', 'https://www.ganhavel.com'];
  if (productionDomains.includes(origin)) return true;
  
  return allowed.some(rule => wildcardMatch(rule, origin) || origin === rule);
}

export function withCORS(handler: Handler): Handler {
  return async (req: Request) => {
    const origin = req.headers.get("Origin");
    const allowed = parseAllowed();

    if (req.method === "OPTIONS") {
      const ok = isAllowedOrigin(origin, allowed);
      const headers = new Headers({
        "Vary": "Origin",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Max-Age": "86400",
      });
      if (ok && origin) headers.set("Access-Control-Allow-Origin", origin);
      return new Response(null, { status: 204, headers });
    }

    const res = await handler(req);
    const hdrs = new Headers(res.headers);
    if (isAllowedOrigin(origin, allowed) && origin) {
      hdrs.set("Access-Control-Allow-Origin", origin);
      hdrs.append("Vary", "Origin");
    }
    return new Response(res.body, { status: res.status, headers: hdrs });
  };
}
