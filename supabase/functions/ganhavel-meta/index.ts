// supabase/functions/ganhavel-meta/index.ts
// Returns static HTML with OG/Twitter meta for crawlers.
// Accepts /ganhavel/<slug>.html or /ganhavel/<uuid>.html
// Always emits canonical with the slug (fallback to id if missing).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SITE = "https://ganhavel.com"; // adjust if needed
const FALLBACK_IMG = `${SITE}/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png`;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RaffleRow = {
  id: string;
  slug: string | null;
  title: string | null;
  description?: string | null;
  image_url?: string | null;
  ticket_price?: number | null;
};

function absoluteImage(url?: string | null): string {
  if (!url) return FALLBACK_IMG;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function html(tags: {
  title: string;
  description: string;
  image: string;
  ogUrl: string;
  canonical: string;
  price?: number | null;
}) {
  const { title, description, image, ogUrl, canonical, price } = tags;
  const priceMeta = (price ?? null) !== null
    ? `<meta property="product:price:amount" content="${price!.toFixed(2)}" />
<meta property="product:price:currency" content="BRL" />`
    : "";

  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}" />

<meta property="og:type" content="product">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${ogUrl}">
${priceMeta}

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">

<noscript>
  <meta http-equiv="refresh" content="0; url=/#${new URL(canonical).pathname}">
</noscript>
</head>
<body>
Carregando…
<script>
  (function () {
    var p = new URL("${canonical}").pathname.replace(/^\\/ganhavel\\//, "/#/ganhavel/");
    if (location.pathname !== p) location.replace(p);
  })();
</script>
</body>
</html>`;
}

async function fetchJson(u: URL) {
  const apiKey = Deno.env.get("SUPABASE_ANON_KEY");
  const baseHeaders = { apikey: apiKey!, Authorization: `Bearer ${apiKey!}` };
  const res = await fetch(u.toString(), { headers: baseHeaders });
  if (!res.ok) return null;
  return await res.json();
}

async function fetchRaffle(key: string): Promise<RaffleRow | null> {
  const isUUID = UUID_RE.test(key);
  const baseUrl = Deno.env.get("SUPABASE_URL");

  // 1) Core identity from raffles
  const q1 = new URL(`${baseUrl}/rest/v1/raffles`);
  q1.searchParams.set("select", "id,slug,title");
  q1.searchParams.set(isUUID ? "id" : "slug", `eq.${key}`);
  q1.searchParams.set("limit", "1");

  const rows1 = await fetchJson(q1);
  const row1 = rows1?.[0];
  if (!row1) return null;

  // 2) Public fields (image/price/desc) from public view by id
  // Adjust view name/columns if your project differs
  const q2 = new URL(`${baseUrl}/rest/v1/raffles_public_money_ext`);
  q2.searchParams.set("select", "id,image_url,ticket_price,description");
  q2.searchParams.set("id", `eq.${row1.id}`);
  q2.searchParams.set("limit", "1");

  const rows2 = await fetchJson(q2);
  const row2 = rows2?.[0] ?? null;

  return {
    id: row1.id,
    slug: row1.slug ?? null,
    title: row1.title ?? null,
    image_url: row2?.image_url ?? null,
    ticket_price: row2?.ticket_price ?? null,
    description: row2?.description ?? null,
  };
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    // supports /ganhavel/<key>.html and /ganhavel/<key>
    const parts = url.pathname.split("/").filter(Boolean);
    const keyPart = parts[1] || "";
    const key = keyPart.replace(/\.html$/i, "");
    if (!key) return new Response("Missing key", { status: 400 });

    // Env checks
    for (const k of ["SUPABASE_URL", "SUPABASE_ANON_KEY"]) {
      if (!Deno.env.get(k)) return new Response(`${k} not configured`, { status: 500 });
    }

    const row = await fetchRaffle(key);
    if (!row) return new Response("Not found", { status: 404 });

    const slug = row.slug ?? row.id;
    const title = row.title ? `${row.title} — Ganhavel` : "Ganhavel";
    const desc = (row.description || "Participe deste ganhavel. Transparente, simples e conectado à Loteria Federal.").trim();
    const canonical = `${SITE}/ganhavel/${slug}.html`;
    const ogUrl = canonical;
    const image = absoluteImage(row.image_url);

    const body = html({
      title,
      description: desc,
      image,
      ogUrl,
      canonical,
      price: row.ticket_price ?? null,
    });

    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(`Error: ${e}`, { status: 500 });
  }
});