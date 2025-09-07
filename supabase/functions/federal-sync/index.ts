import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("🎯 Federal Sync Function - Ready to fetch Federal lottery results");

// Sync latest results of Loteria Federal into public.lottery_latest_federal_store
// Primary: Caixa API, Fallback: API Loterias
// Requires SUPABASE_SERVICE_ROLE_KEY (service role) to bypass RLS for inserts.

serve(withCORS(async (req: Request) => {
  // ---- SAFE BODY PARSE ----
  let body: any = {};
  try { 
    body = await req.json(); 
  } catch { 
    body = {}; 
  }

  const url = new URL(req.url);
  const debug = (url.searchParams.get('debug') ?? body.debug ?? '0') === '1';
  const autoPick = (url.searchParams.get('auto_pick') ?? body.auto_pick ?? '0') === '1';
  const dryRun = (url.searchParams.get('dry_run') ?? body.dry_run ?? '0') === '1';

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "POST only" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // ---- TIMEOUT WRAPPER FOR PROVIDER ----
  const withTimeout = <T,>(p: Promise<T>, ms = 12000) => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    return Promise.race([
      p.then(r => { clearTimeout(t); return r; }),
      new Promise<T>((_, rej) => ac.signal.addEventListener('abort', () => rej(new Error('provider timeout'))))
    ]);
  };

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const apiLoteriasToken = Deno.env.get("API_LOTERIAS_TOKEN");
  
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ ok: false, error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey);
  
  let result = { 
    synced: false, 
    source: '', 
    concurso: '', 
    concurso_number: '',
    draw_date: '', 
    numbers: [] as string[], 
    debug: {} as any,
    prizes_raw: null as any,
    ok: false
  };
  
  // Log admin status helper
  const logStatus = async (fetched_url: string, http_status: number, authorized: boolean) => {
    try {
      await supabase.from("admin_latest_federal_status").upsert({
        last_log_at: new Date().toISOString(),
        last_status: http_status.toString(),
        last_header_present: true,
        last_header_authorized: authorized,
        latest_store_updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn("Failed to log admin status:", e);
    }
  };

    // Try Caixa first
    const caixaUrl = "https://servicebus2.caixa.gov.br/portaldeloterias/api/home/ultimos-resultados";
    try {
      const res = await withTimeout(fetch(caixaUrl, {
        headers: {
          "Accept": "application/json",
          "Cache-Control": "no-cache",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
        },
      }), 12000);

    await logStatus(caixaUrl, res.status, true);
    
    if (res.ok) {
      const text = await res.text();
      let json: any;
      try { 
        json = JSON.parse(text); 
        if (debug) result.debug.caixa_response = json;
      } catch { 
        json = text;
        if (debug) result.debug.caixa_text = text;
      }

      // Parse Caixa Federal data
      const federalItem = await parseFederalData(json, 'caixa', debug);
      if (federalItem) {
        // For dry run, return immediately without DB writes
        if (dryRun) {
          result = { 
            ...federalItem, 
            synced: false, 
            source: 'caixa', 
            ok: true,
            prizes_raw: federalItem.prizes_raw || json
          };
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });
        }
        
        const success = await updateStoreIfChanged(supabase, federalItem, 'caixa');
        if (success) {
          result = { ...federalItem, synced: true, source: 'caixa', ok: true };
          if (autoPick) result.picked = 'deferred_to_trigger';
          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });
        }
      }
    }
  } catch (e) {
    console.warn("Caixa fetch failed:", e);
    if (debug) result.debug.caixa_error = String(e);
  }

    // Fallback to API Loterias
    if (apiLoteriasToken) {
      try {
        const loteriasUrl = "https://apiloterias.com.br/app/v2/result?token=" + apiLoteriasToken + "&loteria=federal";
        const res = await withTimeout(fetch(loteriasUrl), 12000);
      
      await logStatus(loteriasUrl, res.status, !!apiLoteriasToken);
      
      if (res.ok) {
        const json = await res.json();
        if (debug) result.debug.loterias_response = json;
        
        const federalItem = await parseFederalData(json, 'apiloterias', debug);
        if (federalItem) {
          // For dry run, return immediately without DB writes
          if (dryRun) {
            result = { 
              ...federalItem, 
              synced: false, 
              source: 'apiloterias', 
              ok: true,
              prizes_raw: federalItem.prizes_raw || json
            };
            return new Response(JSON.stringify(result), {
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
            });
          }
          
          const success = await updateStoreIfChanged(supabase, federalItem, 'apiloterias');
          if (success) {
            result = { ...federalItem, synced: true, source: 'apiloterias', ok: true };
            if (autoPick) result.picked = 'deferred_to_trigger';
            return new Response(JSON.stringify(result), {
              headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
            });
          }
        }
      }
    } catch (e) {
      console.warn("API Loterias fetch failed:", e);
      if (debug) result.debug.loterias_error = String(e);
    }
  }

    return new Response(JSON.stringify({ ...result, ok: false, error: "No valid Federal data found" }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (err: any) {
    console.error('[federal-sync] error', err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message ?? err) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Helper functions
  async function parseFederalData(json: any, source: string, debug: boolean) {
    try {
      let federalItem = null;
      
      if (source === 'caixa') {
        // Parse Caixa format
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
        
        if (federalItems.length > 0) {
          const item = federalItems[0];
          const concurso = String(item?.numeroConcurso ?? item?.concurso ?? item?.numero ?? "");
          const dataStr = String(item?.dataApuracao ?? item?.data ?? "");
          const prizes = item?.listaResultado ?? item?.premios ?? item?.resultado ?? [];
          
          if (concurso && Array.isArray(prizes) && prizes.length >= 5) {
            federalItem = {
              concurso,
              concurso_number: concurso,
              draw_date: parseDate(dataStr),
              numbers: prizes.slice(0, 5).map((s: string) => String(s).slice(-2).padStart(2, "0")),
              prizes_raw: prizes
            };
          }
        }
      } else if (source === 'apiloterias') {
        // Parse API Loterias format
        const concurso = String(json?.concurso ?? "");
        const dataStr = String(json?.data ?? "");
        const dezenas = json?.dezenas ?? [];
        
        if (concurso && Array.isArray(dezenas) && dezenas.length >= 5) {
          federalItem = {
            concurso,
            concurso_number: concurso,
            draw_date: parseDate(dataStr),
            numbers: dezenas.slice(0, 5).map((s: string) => String(s).padStart(2, "0")),
            prizes_raw: dezenas
          };
        }
      }
      
      if (debug && federalItem) {
        result.debug[`${source}_parsed`] = federalItem;
      }
      
      return federalItem;
    } catch (e) {
      console.warn(`Failed to parse ${source} data:`, e);
      return null;
    }
  }

  function parseDate(dateStr: string): string {
    if (!dateStr) return "";
    
    // Try DD/MM/YYYY format first (Caixa)
    const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
    if (ddmmyyyy) {
      return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
    }
    
    // Try YYYY-MM-DD format (API Loterias)
    const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (yyyymmdd) {
      return dateStr;
    }
    
    return "";
  }

  async function updateStoreIfChanged(supabase: any, federalItem: any, source: string) {
    try {
      // Check current store
      const { data: current } = await supabase
        .from("lottery_latest_federal_store")
        .select("concurso_number, numbers")
        .eq("game_slug", "federal")
        .maybeSingle();
      
      // Only update if concurso or numbers changed
      const shouldUpdate = !current || 
        current.concurso_number !== federalItem.concurso ||
        JSON.stringify(current.numbers) !== JSON.stringify(federalItem.numbers);
      
      if (shouldUpdate) {
        const { error } = await supabase
          .from("lottery_latest_federal_store")
          .upsert({
            game_slug: "federal",
            concurso_number: federalItem.concurso,
            draw_date: federalItem.draw_date,
            numbers: federalItem.numbers,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error("Failed to update store:", error);
          return false;
        }
        
        console.log(`✅ Updated federal store from ${source}: ${federalItem.concurso}`);
        return true;
      }
      
      console.log(`ℹ️ No update needed for ${source}: ${federalItem.concurso}`);
      return false;
    } catch (e) {
      console.error("Update store error:", e);
      return false;
    }
  }
}));
