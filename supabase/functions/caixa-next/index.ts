import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Fetches CAIXA data and stores lightweight rows for each game in lottery_next_draws
// Note: This function writes to DB and requires SERVICE ROLE key.
// Set SUPABASE_SERVICE_ROLE_KEY in Functions Secrets.

serve(withCORS(async (req: Request) => {
  console.log("📡 Caixa Next Function - Fetching next draws from CAIXA API");
  
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Missing environment variables");
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const sourceUrl = "https://servicebus2.caixa.gov.br/portaldeloterias/api/home/ultimos-resultados";
  try {
    const res = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
      },
    });

    const text = await res.text();
    let json: unknown;
    try { json = JSON.parse(text); } catch { json = { rawText: text }; }

    // Normalize into an array of games with dates and times: slug + name + next_date + next_time
    const rows: { game_slug: string; game_name: string; next_date?: string; next_time?: string; source_url?: string; raw?: unknown }[] = [];

    // The CAIXA payload shape varies; we try to extract keys robustly
    if (Array.isArray(json)) {
      for (const item of json) {
        const name = (item as any)?.loteria || (item as any)?.modalidade || (item as any)?.tipoJogo || "unknown";
        const slug = String(name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        
        // Extract next draw date and time
        const nextDraw = (item as any)?.dataProximoConcurso || (item as any)?.proximoConcurso || (item as any)?.proximoSorteio;
        let nextDate: string | undefined;
        let nextTime: string | undefined;
        
        if (nextDraw) {
          try {
            const date = new Date(nextDraw);
            if (!isNaN(date.getTime())) {
              nextDate = date.toISOString().split('T')[0];
              nextTime = "20:00"; // Default CAIXA time
            }
          } catch (e) {
            // Parse string format like "DD/MM/YYYY"
            const match = String(nextDraw).match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
              const [, day, month, year] = match;
              nextDate = `${year}-${month}-${day}`;
              nextTime = "20:00";
            }
          }
        }
        
        rows.push({ game_slug: slug, game_name: String(name), next_date: nextDate, next_time: nextTime, source_url: sourceUrl, raw: item });
      }
    } else if (json && typeof json === "object") {
      for (const [key, val] of Object.entries(json as Record<string, unknown>)) {
        const name = (val as any)?.loteria || (val as any)?.modalidade || key;
        const slug = String(key || name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        
        // Extract next draw date and time
        const nextDraw = (val as any)?.dataProximoConcurso || (val as any)?.proximoConcurso || (val as any)?.proximoSorteio;
        let nextDate: string | undefined;
        let nextTime: string | undefined;
        
        if (nextDraw) {
          try {
            const date = new Date(nextDraw);
            if (!isNaN(date.getTime())) {
              nextDate = date.toISOString().split('T')[0];
              nextTime = "20:00";
            }
          } catch (e) {
            const match = String(nextDraw).match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (match) {
              const [, day, month, year] = match;
              nextDate = `${year}-${month}-${day}`;
              nextTime = "20:00";
            }
          }
        }
        
        rows.push({ game_slug: slug, game_name: String(name), next_date: nextDate, next_time: nextTime, source_url: sourceUrl, raw: val });
      }
    }

    // Upsert one row per game_slug (select->insert or update)
    const results: any[] = [];
    for (const r of rows) {
      // Does a row exist for this game_slug?
      const { data: existing, error: selErr } = await supabase
        .from("lottery_next_draws")
        .select("id, game_slug")
        .eq("game_slug", r.game_slug)
        .limit(1)
        .maybeSingle();
      if (selErr) results.push({ game: r.game_slug, error: selErr.message });

      if (existing) {
        const { error: updErr } = await supabase
          .from("lottery_next_draws")
          .update({ 
            game_name: r.game_name, 
            next_date: r.next_date, 
            next_time: r.next_time, 
            source_url: r.source_url, 
            raw: r.raw 
          })
          .eq("id", (existing as any).id);
        results.push({ game: r.game_slug, updated: !updErr, error: updErr?.message });
      } else {
        const { error: insErr } = await supabase
          .from("lottery_next_draws")
          .insert({ 
            game_slug: r.game_slug, 
            game_name: r.game_name, 
            next_date: r.next_date, 
            next_time: r.next_time, 
            source_url: r.source_url, 
            raw: r.raw 
          });
        results.push({ game: r.game_slug, inserted: !insErr, error: insErr?.message });
      }
    }

    return new Response(JSON.stringify({ sourceUrl, count: rows.length, results }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), sourceUrl }), { status: 500 });
  }
}));
