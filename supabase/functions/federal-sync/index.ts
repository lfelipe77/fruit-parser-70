import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Sync latest results of Loteria Federal into public.federal_draws
// Requires SUPABASE_SERVICE_ROLE_KEY (service role) to bypass RLS for inserts.

serve(withCORS(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
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
    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    // Try to locate the Federal results entry
    let federalItems: any[] = [];
    if (Array.isArray(json)) {
      federalItems = json.filter((it) => {
        const name = (it?.loteria || it?.modalidade || it?.tipoJogo || "").toString().toLowerCase();
        return name.includes("federal");
      });
    } else if (json && typeof json === "object") {
      for (const [k, v] of Object.entries(json)) {
        const name = (v as any)?.loteria || (v as any)?.modalidade || k;
        if (String(name).toLowerCase().includes("federal")) federalItems.push(v);
      }
    }

    if (federalItems.length === 0) {
      return new Response(JSON.stringify({ ok: true, inserted: 0, message: "No federal entry found", sourceUrl }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];
    for (const item of federalItems) {
      const concurso = String(item?.numeroConcurso ?? item?.concurso ?? item?.numero ?? "");
      const dataStr = String(item?.dataApuracao ?? item?.data ?? "");
      const drawDate = dataStr ? new Date(dataStr) : null;
      const prizes = item?.listaResultado ?? item?.premios ?? item?.resultado ?? [];
      const firstPrize = Array.isArray(prizes) && prizes.length > 0 ? String(prizes[0]) : null;

      if (!concurso) continue;

      // Check if draw exists
      const { data: existing, error: selErr } = await supabase
        .from("federal_draws")
        .select("id, concurso_number")
        .eq("concurso_number", concurso)
        .limit(1)
        .maybeSingle();

      if (selErr) {
        results.push({ concurso, error: selErr.message });
        continue;
      }

      if (existing) {
        const { error: updErr } = await supabase
          .from("federal_draws")
          .update({
            draw_date: drawDate ? drawDate.toISOString() : null,
            prizes: Array.isArray(prizes) ? prizes : [prizes],
            raw: item,
            first_prize: firstPrize,
            source_url: sourceUrl,
          })
          .eq("id", (existing as any).id);
        results.push({ concurso, updated: !updErr, error: updErr?.message });
      } else {
        const { error: insErr } = await supabase
          .from("federal_draws")
          .insert({
            concurso_number: concurso,
            draw_date: drawDate ? drawDate.toISOString() : null,
            prizes: Array.isArray(prizes) ? prizes : [prizes],
            raw: item,
            first_prize: firstPrize,
            source_url: sourceUrl,
          });
        results.push({ concurso, inserted: !insErr, error: insErr?.message });
      }
    }

    return new Response(JSON.stringify({ ok: true, count: results.length, results, sourceUrl }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), sourceUrl }), { status: 500 });
  }
}));
