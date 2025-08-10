// Shared CORS middleware for Supabase Edge Functions
// Reads allowed origins from the ALLOWED_ORIGINS secret (comma-separated or "*")
// Ensures CORS headers on all responses, including OPTIONS

export type Handler = (req: Request) => Promise<Response> | Response;

function parseAllowedOrigins(envValue?: string | null): string[] | null {
  if (!envValue || envValue.trim() === "") return ["*"]; // default allow all
  const list = envValue
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return list.length ? list : ["*"];
}

export function withCORS(handler: Handler): Handler {
  const allowedList = parseAllowedOrigins(Deno.env.get("ALLOWED_ORIGINS"));

  return async (req: Request) => {
    const origin = req.headers.get("origin") ?? "";

    const wildcard = allowedList?.includes("*") ?? true;
    const isAllowed = wildcard || (origin && allowedList?.includes(origin));

    const baseHeaders: HeadersInit = {
      "Vary": "Origin",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    };

    // Preflight
    if (req.method === "OPTIONS") {
      if (!isAllowed) {
        return new Response("CORS origin not allowed", {
          status: 403,
          headers: baseHeaders,
        });
      }
      const headers: HeadersInit = {
        ...baseHeaders,
        "Access-Control-Allow-Origin": wildcard ? "*" : origin,
        "Access-Control-Max-Age": "86400",
      };
      return new Response("ok", { headers });
    }

    // Non-OPTIONS
    if (!isAllowed) {
      // Block disallowed origins explicitly
      return new Response(JSON.stringify({ error: "CORS origin not allowed" }), {
        status: 403,
        headers: {
          ...baseHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const res = await handler(req);

    // Merge/override CORS headers
    const newHeaders = new Headers(res.headers);
    newHeaders.set("Vary", "Origin");
    newHeaders.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
    newHeaders.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    newHeaders.set("Access-Control-Allow-Origin", wildcard ? "*" : origin);

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  };
}
