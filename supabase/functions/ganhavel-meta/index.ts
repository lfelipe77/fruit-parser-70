// supabase/functions/ganhavel-meta/index.ts
// Returns static HTML with OG/Twitter meta for crawlers.
// Accepts /ganhavel/<slug>.html or /ganhavel/<uuid>.html
// Always emits canonical with the slug (fallback to id if missing).

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SITE = "https://ganhavel.com";
const FALLBACK_IMG = `${SITE}/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png";
const BOT_UA = /(facebookexternalhit|whatsapp|WhatsApp|twitterbot|linkedinbot|telegrambot|discordbot|slackbot|googlebot|bingbot|duckduckbot|yandex|baiduspider|pinterest)/i;

function absoluteImage(url?: string | null) {
  if (!url) return FALLBACK_IMG;
  if (/^https?:\/\//i.test(url)) return url;        // already absolute
  return `${SITE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function botHtml(tags: {
  title: string;
  description: string;
  image: string;
  ogUrl: string;
  canonical: string;
  price: number | null;
}) {
  const { title, description, image, ogUrl, canonical, price } = tags;
  const priceMeta = price !== null
    ? `<meta property="product:price:amount" content="${price.toFixed(2)}" />
       <meta property="product:price:currency" content="BRL" />`
    : "";
  return `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="product">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${ogUrl}">
<meta property="og:site_name" content="Ganhavel">
${priceMeta}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:site" content="@ganhavel">
</head><body></body></html>`;
}

async function fetchJson(u: URL) {
  const apiKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const res = await fetch(u.toString(), { headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) return null;
  return await res.json();
}

async function fetchRaffle(key: string) {
  if (!key || key.includes("<") || key.includes(">") || key.length < 3) return null;

  const baseUrl = Deno.env.get("SUPABASE_URL")!;
  const apiKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const headers = { apikey: apiKey, Authorization: `Bearer ${apiKey}` };

  async function getOne(u: URL) {
    const r = await fetch(u.toString(), { headers });
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j) && j[0] ? j[0] : null;
  }

  // (1) slug exact
  {
    const u = new URL(`${baseUrl}/rest/v1/raffles`);
    u.searchParams.set("select", "id,slug,title");
    u.searchParams.set("slug", `eq.${key}`);
    u.searchParams.set("limit", "1");
    const row = await getOne(u);
    if (row) return await hydrate(row);
  }
  // (2) slug ilike
  {
    const u = new URL(`${baseUrl}/rest/v1/raffles`);
    u.searchParams.set("select", "id,slug,title");
    u.searchParams.set("slug", `ilike.${key}`);
    u.searchParams.set("limit", "1");
    const row = await getOne(u);
    if (row) return await hydrate(row);
  }
  // (3) id
  {
    const u = new URL(`${baseUrl}/rest/v1/raffles`);
    u.searchParams.set("select", "id,slug,title");
    u.searchParams.set("id", `eq.${key}`);
    u.searchParams.set("limit", "1");
    const row = await getOne(u);
    if (row) return await hydrate(row);
  }
  return null;

  async function hydrate(row1: any) {
    const u2 = new URL(`${baseUrl}/rest/v1/raffles_public_money_ext`);
    u2.searchParams.set("select", "id,image_url,ticket_price,description");
    u2.searchParams.set("id", `eq.${row1.id}`);
    u2.searchParams.set("limit", "1");
    const r2 = await fetch(u2.toString(), { headers });
    const j2 = r2.ok ? await r2.json() : [];
    const row2 = Array.isArray(j2) && j2[0] ? j2[0] : null;
    return {
      id: row1.id,
      slug: row1.slug ?? row1.id,
      title: row1.title ?? "Ganhavel",
      image_url: row2?.image_url ?? null,
      ticket_price: row2?.ticket_price ?? null,
      description: row2?.description ?? null
    };
  }
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // ["ganhavel","<key>[.html]"]
    const keyPart = parts[1] || "";
    const key = keyPart.replace(/\.html$/i, "");
    if (!key) return new Response("Missing key", { status: 400 });

    const ua = req.headers.get("user-agent") || "";
    const isBot = BOT_UA.test(ua);

    for (const k of ["SUPABASE_URL", "SUPABASE_ANON_KEY"]) {
      if (!Deno.env.get(k)) return new Response(`${k} not configured`, { status: 500 });
    }

    const row = await fetchRaffle(key);
    if (!row) return new Response("Not found", { status: 404 });

    const slug = row.slug;
    const title = `${row.title} — Ganhavel`;
    const cta   = `Participe deste ganhavel e concorra a ${row.title}! Transparente, simples e conectado à Loteria Federal.`;
    const canonical = `${SITE}/ganhavel/${slug}`;
    const ogUrl     = url.toString(); // exactly what was requested (keeps .html?v=...)

    // Build image safely: if already absolute (Supabase Storage), keep as-is.
    let img = absoluteImage(row.image_url);
    // If you ever serve local images (e.g., /og/xxx.jpg), you can version them like:
    // if (img.startsWith(SITE)) img += (img.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(row.id);

    if (url.searchParams.get("debug") === "1") {
      return new Response(JSON.stringify({
        title, description: cta, image: img, ogUrl, canonical,
        price: row.ticket_price ?? null, slug, id: row.id, userAgent: ua, isBot
      }, null, 2), { status: 200, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
    }

    if (isBot) {
      const body = botHtml({ title, description: cta, image: img, ogUrl, canonical, price: row.ticket_price ?? null });
      return new Response(body, {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "public, max-age=1800",
          "Vary": "User-Agent" // important so CF separates bot/human cache
        }
      });
    }

    // humans → clean URL
    return Response.redirect(canonical, 302);
  } catch (e) {
    return new Response(`Error: ${e}`, { status: 500 });
  }
});
