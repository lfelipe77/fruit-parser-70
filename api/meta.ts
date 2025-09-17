// api/meta.ts
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const key = (url.searchParams.get("key") || "").replace(/\.html$/i, "");
    if (!key) return new Response("Missing key", { status: 400 });

    const base = process.env.SUPABASE_FUNCTIONS_URL || "https://whqxpuyjxoiufzhvqneg.functions.supabase.co";
    const anon = process.env.SUPABASE_ANON_KEY;
    if (!anon) return new Response("Missing SUPABASE_ANON_KEY", { status: 500 });

    // Pass the original URL with .html to Supabase function + query params
    const upstreamUrl = new URL(`${base}/ganhavel-meta/${encodeURIComponent(key)}.html`);
    // Copy query params (like ?debug=1) from original request
    url.searchParams.forEach((value, key) => {
      if (key !== 'key') upstreamUrl.searchParams.set(key, value);
    });
    const upstream = await fetch(upstreamUrl, {
      headers: {
        "Authorization": `Bearer ${anon}`,
        "apikey": anon,
        "Accept": "text/html, */*;q=0.8",
        "User-Agent": req.headers.get("user-agent") ?? ""
      },
      redirect: "manual" // Don't follow redirects, let browser handle them
    });

    const html = await upstream.text();
    return new Response(html, {
      status: upstream.status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": upstream.ok ? "public, max-age=3600" : "no-cache",
        "x-meta-proxy": "vercel-edge",
        "x-meta-body-len": String(html.length)
      }
    });
  } catch (e) {
    return new Response(`Proxy error: ${e}`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-cache" }
    });
  }
}