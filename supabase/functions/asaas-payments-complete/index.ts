import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Brazilian document validation helpers
function onlyDigits(v?: string | null): string { 
  return (v ?? '').replace(/\D+/g, ''); 
}

function isValidCPF(raw?: string | null): boolean {
  const v = onlyDigits(raw);
  if (v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;
  let s = 0; for (let i = 0; i < 9; i++) s += Number(v[i]) * (10 - i);
  let d1 = (s * 10) % 11; if (d1 === 10) d1 = 0; if (d1 !== Number(v[9])) return false;
  s = 0; for (let i = 0; i < 10; i++) s += Number(v[i]) * (11 - i);
  let d2 = (s * 10) % 11; if (d2 === 10) d2 = 0; return d2 === Number(v[10]);
}

function isValidCNPJ(raw?: string | null): boolean {
  const v = onlyDigits(raw);
  if (v.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(v)) return false;
  const calc = (len: number) => {
    const w = len === 12 ? [5,4,3,2,9,8,7,6,5,4,3,2] : [6,5,4,3,2,9,8,7,6,5,4,3,2];
    let s = 0; for (let i = 0; i < w.length; i++) s += Number(v[i]) * w[i];
    const m = s % 11; return m < 2 ? 0 : 11 - m;
  };
  const d1 = calc(12); if (d1 !== Number(v[12])) return false;
  const d2 = calc(13); return d2 === Number(v[13]);
}

function normalizeCpfCnpjOrNull(raw?: string | null): { digits: string; type: "FISICA" | "JURIDICA" } | null {
  const cleaned = onlyDigits((raw ?? '').trim());
  if (!cleaned) return null;
  if (isValidCPF(cleaned))  return { digits: cleaned, type: "FISICA" };
  if (isValidCNPJ(cleaned)) return { digits: cleaned, type: "JURIDICA" };
  return null;
}

const bad = (msg: string, detail?: unknown) =>
  new Response(JSON.stringify({ error: msg, detail }), { 
    status: 422, 
    headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' } 
  });

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type, access_token",
  "vary": "Origin",
};

function json(body: any, init: ResponseInit = {}) {
  const h = new Headers(init.headers || {});
  for (const [k, v] of Object.entries(CORS_HEADERS)) h.set(k, String(v));
  h.set("content-type", "application/json; charset=utf-8");
  h.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { ...init, headers: h });
}

function noContent(init: ResponseInit = {}) {
  const h = new Headers(init.headers || {});
  for (const [k, v] of Object.entries(CORS_HEADERS)) h.set(k, String(v));
  return new Response(null, { ...init, headers: h, status: 204 });
}

async function getUserFromAuth(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^bearer\s+(.+)$/i);
  const jwt = m?.[1] || "";

  if (!jwt) return { error: "Missing Authorization Bearer token" };

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });

  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) return { error: "Invalid JWT" };
  return { user: data.user, jwt };
}

export default {
  async fetch(req: Request) {
    // CORS preflight
    if (req.method === "OPTIONS") return noContent();

    if (req.method !== "POST") {
      return json({ error: "Method Not Allowed" }, { status: 405 });
    }

    // 1) Auth: use Authorization Bearer only
    const { user, error } = await getUserFromAuth(req) as any;
    if (!user) return json({ error: error || "Unauthorized" }, { status: 401 });

    // 2) Parse input
    let payload: any;
    try {
      payload = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Accept both camelCase and snake_case formats for backward compatibility
    const reservationId = payload?.reservationId ?? payload?.reservation_id ?? null;
    const value = typeof payload?.value === 'number' ? payload.value 
                : (typeof payload?.amount === 'number' ? payload.amount : null);
    const description = payload?.description ?? "Compra de bilhetes";
    
    if (!reservationId || !value) {
      return json({ error: "Missing required fields: reservationId and value" }, { status: 400 });
    }

    // Get user profile and validate document
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tax_id, cpf_cnpj, full_name, username')
      .eq('id', user.id)
      .single();

    const rawDoc = profile?.tax_id ?? profile?.cpf_cnpj ?? null;
    const doc = normalizeCpfCnpjOrNull(
      typeof rawDoc === 'string' && rawDoc.toLowerCase() !== 'null' ? rawDoc : null
    );
    
    if (!doc) {
      return bad("Documento inválido. Atualize seu CPF (11) ou CNPJ (14) no perfil (somente números) para gerar o PIX.");
    }

    const customerName = profile?.full_name || profile?.username || "Cliente Ganhavel";
    const customer = {
      name: customerName,
      email: user.email || "cliente@ganhavel.com",
      cpfCnpj: doc.digits,
      personType: doc.type,
      mobilePhone: "11999999999",
      externalReference: user.id,
    };

    // 3) Call Asaas
    const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_BASE = Deno.env.get("ASAAS_BASE_URL") || "https://api-sandbox.asaas.com/v3";
    if (!ASAAS_KEY) return json({ error: "Asaas not configured" }, { status: 500 });

    const asaasHeaders = {
      "access_token": ASAAS_KEY, // Asaas expects access_token header, not Authorization
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // 3a) Ensure/Find customer
    const custRes = await fetch(`${ASAAS_BASE}/customers`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        cpfCnpj: customer.cpfCnpj,
        mobilePhone: customer.mobilePhone,
      }),
    });

    const cust = await custRes.json();
    if (!custRes.ok) {
      return json({ error: "Asaas customer error", detail: cust }, { status: custRes.status });
    }

    const customerId = cust?.id || cust?.data?.[0]?.id;
    if (!customerId) return json({ error: "Missing Asaas customer id", detail: cust }, { status: 502 });

    // 3b) Create payment (set externalReference = reservationId)
    const payRes = await fetch(`${ASAAS_BASE}/payments`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        customer: customerId,
        value: value,
        billingType: "PIX",
        externalReference: reservationId,
        dueDate: (() => {
          // Generate dueDate in São Paulo timezone to avoid UTC date issues
          const spParts = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo', 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
          }).formatToParts(new Date());
          const year = spParts.find(x => x.type === 'year')!.value;
          const month = spParts.find(x => x.type === 'month')!.value;  
          const day = spParts.find(x => x.type === 'day')!.value;
          return `${year}-${month}-${day}`;
        })(),
        description: description || "Compra de bilhetes",
      }),
    });
    const pay = await payRes.json();
    if (!payRes.ok) {
      return json({ error: "Asaas payment error", detail: pay }, { status: payRes.status });
    }

    const payment_id = pay?.id;
    if (!payment_id) return json({ error: "Missing payment id", detail: pay }, { status: 502 });

    // 3c) Get PIX QR
    const qrRes = await fetch(`${ASAAS_BASE}/payments/${payment_id}/pixQrCode`, {
      method: "GET",
      headers: asaasHeaders,
    });
    const qrRaw = await qrRes.json();
    if (!qrRes.ok) {
      return json({ error: "Asaas QR error", detail: qrRaw }, { status: qrRes.status });
    }

    // Normalize QR image with consistent data: prefix
    const base64 = qrRaw?.encodedImage || qrRaw?.image || "";
    const payloadCode = qrRaw?.payload || qrRaw?.payloadCode || qrRaw?.qrCodeText || "";
    const encodedImage = base64 && String(base64).startsWith("data:")
      ? base64
      : (base64 ? `data:image/png;base64,${base64}` : "");

    return json({
      payment_id,
      qr: {
        encodedImage,
        payload: payloadCode,
        expiresAt: qrRaw?.expiresAt || qrRaw?.expirationDate,
      },
      value: Number(value),
    });
  },
};