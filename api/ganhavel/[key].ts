// api/ganhavel/[key].ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.pathname;                      // /api/ganhavel/<key>[.html]
    const keyRaw = path.split("/").pop() || "";
    const key = keyRaw.replace(/\.html$/i, "");
    if (!key) return new Response("Missing key", { status: 400 });

    // Supabase Edge Functions base URL (project: whqxpuyjxoiufzhvqneg)
    const base = process.env.SUPABASE_FUNCTIONS_URL
      || "https://whqxpuyjxoiufzhvqneg.functions.supabase.co";

    // Supabase anon key (required for Authorization)
    const anon = process.env.SUPABASE_ANON_KEY;
    if (!anon) {
      return new Response("Supabase env not configured (missing SUPABASE_ANON_KEY)", { status: 500 });
    }

    // Proxy to ganhavel-meta with ?key=
    const target = `${base}/ganhavel-meta?key=${encodeURIComponent(key)}`;

    const upstream = await fetch(target, {
      headers: {
        "Authorization": `Bearer ${anon}`,   // required by Supabase Functions with verify_jwt=true
        "apikey": anon,
        "Accept": "text/html, */*;q=0.8",
        "User-Agent": req.headers.get("user-agent") ?? "",
      },
      redirect: "follow",
    });

    const html = await upstream.text(); // ensure body is read
    const status = upstream.status;

    // Pass through HTML with sane cache headers for crawlers
    return new Response(html, {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": status === 200 ? "public, max-age=3600" : "no-cache",
        "x-meta-proxy": "vercel-edge",
        "x-meta-body-len": String(html.length),
      },
    });
  } catch (e) {
    return new Response(`Proxy error: ${e}`, {
      status: 500,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  }
}