// supabase/functions/ganhavel-meta/index.ts
// Returns static HTML with OG/Twitter meta for crawlers.
// Accepts /ganhavel/<slug>.html or /ganhavel/<uuid>.html
// Always emits canonical with the slug (fallback to id if missing).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SITE = "https://ganhavel.com";
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

function html(tags: { title: string; description: string; image: string; ogUrl: string; canonical: string; price: number | null }) {
  const { title, description, image, ogUrl, canonical, price } = tags;
  const priceMeta =
    price !== null
      ? `<meta property="product:price:amount" content="${price.toFixed(2)}" />
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
  <meta http-equiv="refresh" content="0; url=/ganhavel/${canonical.split('/').pop()?.replace(/\\.html$/i, '')}">
</noscript>
</head>
<body>
<div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
  <h2>Carregando...</h2>
  <p>Se você não for redirecionado automaticamente, <a href="#" onclick="goToCleanUrl()" style="color: #10b981;">clique aqui</a>.</p>
</div>
<script>
  // Redirect .html -> clean SPA route immediately
  function goToCleanUrl() {
    try {
      var path = location.pathname;
      if (path.toLowerCase().endsWith('.html')) {
        var cleanPath = path.slice(0, -5); // Remove .html
        window.location.href = cleanPath;
      }
    } catch (e) {
      console.error('Redirect error:', e);
    }
  }
  
  // Auto-redirect on page load
  goToCleanUrl();
</script>
</html>`;
}

async function fetchJson(u: URL) {
  const apiKey = Deno.env.get("SUPABASE_ANON_KEY");
  const baseHeaders = { apikey: apiKey, Authorization: `Bearer ${apiKey}` };
  const res = await fetch(u.toString(), { headers: baseHeaders });
  if (!res.ok) return null;
  return await res.json();
}

async function fetchRaffle(key: string) {
  const isUUID = UUID_RE.test(key);
  const baseUrl = Deno.env.get("SUPABASE_URL")!;
  // 1) Identity
  const q1 = new URL(`${baseUrl}/rest/v1/raffles`);
  q1.searchParams.set("select", "id,slug,title");
  q1.searchParams.set(isUUID ? "id" : "slug", `eq.${key}`);
  q1.searchParams.set("limit", "1");
  const rows1 = await fetchJson(q1);
  const row1 = rows1?.[0];
  if (!row1) return null;
  // 2) Public fields
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
    description: row2?.description ?? null
  };
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const parts = path.split("/").filter(Boolean);
    const keyPart = parts[1] || ""; // /ganhavel/:key(.html)
    const key = keyPart.replace(/\.html$/i, "");
    if (!key) return new Response("Missing key", { status: 400 });

    // Note: No guard redirect here since this function is called by our API proxy
    // The routing logic is handled by vercel.json: only .html URLs reach this function

    // Env checks
    for (const k of ["SUPABASE_URL", "SUPABASE_ANON_KEY"]) {
      if (!Deno.env.get(k)) return new Response(`${k} not configured`, { status: 500 });
    }

    const row = await fetchRaffle(key);
    if (!row) return new Response("Not found", { status: 404 });

    const slug = row.slug ?? row.id;
    const title = row.title ? `${row.title} — Ganhavel` : "Ganhavel";
    const cta = row.title
      ? `Participe deste ganhavel e concorra a ${row.title}! Transparente, simples e conectado à Loteria Federal.`
      : "Participe deste ganhavel. Transparente, simples e conectado à Loteria Federal.";
    const canonical = `${SITE}/ganhavel/${slug}`;
    const ogUrl = `${SITE}/ganhavel/${slug}.html`;
    const image = absoluteImage(row.image_url);

    // 🔎 Debug mode for QA: return JSON (no HTML) when ?debug=1
    if (url.searchParams.get("debug") === "1") {
      return new Response(
        JSON.stringify(
          { title, description: cta, image, ogUrl, canonical, price: row.ticket_price ?? null, slug, id: row.id },
          null,
          2
        ),
        { status: 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }
      );
    }

    const body = html({
      title,
      description: cta,
      image,
      ogUrl,
      canonical,
      price: row.ticket_price ?? null
    });

    return new Response(body, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=1800" } // 30 min
    });
  } catch (e) {
    return new Response(`Error: ${e}`, { status: 500 });
  }
});