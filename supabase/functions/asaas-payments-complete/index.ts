import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Brazilian document validation helpers
function onlyDigits(v?: unknown): string {
  return typeof v === 'string' ? v.replace(/\D+/g, '') : '';
}
function isValidCPF(raw?: unknown): boolean {
  const v = onlyDigits(raw);
  if (v.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(v)) return false;
  let s = 0; for (let i = 0; i < 9; i++) s += Number(v[i]) * (10 - i);
  let d1 = (s * 10) % 11; if (d1 === 10) d1 = 0; if (d1 !== Number(v[9])) return false;
  s = 0; for (let i = 0; i < 10; i++) s += Number(v[i]) * (11 - i);
  let d2 = (s * 10) % 11; if (d2 === 10) d2 = 0; return d2 === Number(v[10]);
}
function isValidCNPJ(raw?: unknown): boolean {
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
type PersonType = 'FISICA' | 'JURIDICA';
function normalizeCpfCnpjOrNull(raw: unknown): { digits: string; type: PersonType } | null {
  const digits = onlyDigits(raw);
  if (!digits) return null;
  if (isValidCPF(digits))  return { digits, type: 'FISICA' };
  if (isValidCNPJ(digits)) return { digits, type: 'JURIDICA' };
  return null;
}
function sanitizeBRPhone(raw?: unknown): string | null {
  if (raw == null) return null;
  let d = String(raw).replace(/\D+/g, '');
  // Strip +55 or 55 country code if present
  if (d.startsWith('55') && (d.length === 13 || d.length === 12)) d = d.slice(2);
  // Accept only 10 or 11 digits (2-digit DDD + number)
  if (d.length === 10 || d.length === 11) return d;
  return null;
}
// São Paulo due date generator (YYYY-MM-DD) with no deps
function dueDateSP(): string {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

const ALLOWED = (
  (typeof Deno !== 'undefined' ? Deno.env.get('ALLOWED_ORIGINS') : undefined)
  || (typeof process !== 'undefined' ? (process as any).env?.ALLOWED_ORIGINS : undefined)
  || 'https://ganhavel.com,https://www.ganhavel.com,http://localhost:3000'
).split(',').map(s => s.trim()).filter(Boolean);

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}
function withCORS(res: Response, origin: string | null) {
  const h = new Headers(res.headers);
  const c = corsHeaders(origin);
  Object.entries(c).forEach(([k, v]) => h.set(k, v as string));
  return new Response(res.body, { status: res.status, headers: h });
}
function json(body: unknown, init: ResponseInit = {}, origin: string | null = null) {
  const res = new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...(init.headers||{}) }
  });
  return withCORS(res, origin);
}
const bad = (msg: string, detail: unknown = undefined, origin: string | null = null) =>
  json({ error: msg, detail }, { status: 422 }, origin);

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
    const origin = req.headers.get('origin');
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return withCORS(new Response(null, { status: 204 }), origin);
    }

    if (req.method !== 'POST') {
      return json({ ok: false, error: 'Method Not Allowed' }, { status: 405 }, origin);
    }

    // 1) Auth: use Authorization Bearer only
    const { user, jwt, error } = await getUserFromAuth(req) as any;
    if (!user) return json({ error: error || "Unauthorized" }, { status: 401 }, origin);

    // Create Supabase client for DB operations with user's JWT
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false },
    });

    // 2) Parse input
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, { status: 400 }, origin);
    }

    // After parsing body:
    console.log('[PIX] in', { hasJWT: !!jwt, bodyKeys: Object.keys(body || {}) });

    // Accept both camelCase and snake_case formats for backward compatibility
    const reservationId = body?.reservationId ?? body?.reservation_id ?? null;
    const value = (typeof body?.value === 'number' ? body.value :
                 (typeof body?.amount === 'number' ? body.amount : null));
    const description = body?.description ?? "Compra de bilhetes";

    const dueDate = dueDateSP();
    console.log('[PIX] mapped', { reservationId, value, dueDate });
    
    if (!reservationId || !value) {
      return json({ error: "Missing required fields: reservationId and value" }, { status: 400 }, origin);
    }

    // Get user profile and validate document
    const { data: profile, error: profErr } = await sb
      .from('user_profiles')
      .select('id,tax_id')
      .eq('id', user.id)
      .single();

    console.log('[PIX] profile', {
      userId: user.id,
      profErr: !!profErr,
      hasProfile: !!profile,
      tax_id: profile?.tax_id,
      tax_id_typeof: typeof profile?.tax_id,
      digits_len: onlyDigits(profile?.tax_id).length,
      digits_preview: onlyDigits(profile?.tax_id).slice(0, 6),
    });
    if (profErr || !profile) {
      return json({ error: 'Profile not found' }, { status: 404 }, origin);
    }

    const RAW = profile.tax_id;
    const rawDoc = (typeof RAW === 'string' && RAW.toLowerCase() !== 'null') ? RAW : null;
    const digits = onlyDigits(rawDoc);
    const doc = normalizeCpfCnpjOrNull(rawDoc);

    const LEN_ONLY = (typeof Deno !== 'undefined' ? Deno.env.get('ALLOW_LEN_ONLY') : undefined) === '1';
    const lenOk = digits.length === 11 || digits.length === 14;

    console.log('[PIX] docCheck', {
      rawDoc,
      digits,
      len: digits.length,
      lenOk,
      cpfValid: isValidCPF(digits),
      cnpjValid: isValidCNPJ(digits),
      normalized: !!doc,
      fallbackLenOnly: LEN_ONLY
    });

    const docFinal = doc ?? (LEN_ONLY && lenOk ? { digits, type: (digits.length === 11 ? 'FISICA' : 'JURIDICA') as PersonType } : null);

    if (!docFinal) {
      return json(
        { error: 'Documento inválido. Atualize seu CPF (11) ou CNPJ (14) no perfil (somente números) para gerar o PIX.' },
        { status: 422 },
        origin
      );
    }

    const customerName = "Cliente Ganhavel";
    const mobilePhone = sanitizeBRPhone(body?.customer?.phone ?? profile?.whatsapp ?? profile?.phone);
    const customerPayload = {
      name: customerName || "Cliente",
      email: user.email || undefined,
      // only send if valid; Asaas rejects invalid_mobilePhone otherwise
      ...(mobilePhone ? { mobilePhone } : {}),
      cpfCnpj: docFinal.digits,
      personType: docFinal.type,
      externalReference: user.id,
    };
    console.log('[PIX] phoneCheck', { raw: body?.customer?.phone ?? null, mobilePhone });

    // 3) Call Asaas
    const ASAAS_KEY = Deno.env.get("ASAAS_API_KEY");
    const ASAAS_BASE = Deno.env.get("ASAAS_BASE_URL") || "https://api-sandbox.asaas.com/v3";
    if (!ASAAS_KEY) return json({ error: "Asaas not configured" }, { status: 500 }, origin);

    const asaasHeaders = {
      "access_token": ASAAS_KEY, // Asaas expects access_token header, not Authorization
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    // 3a) Ensure/Find customer
    const custRes = await fetch(`${ASAAS_BASE}/customers`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify(customerPayload),
    });

    const cust = await custRes.json();
    if (!custRes.ok) {
      return json({ error: "Asaas customer error", detail: cust }, { status: custRes.status }, origin);
    }

    const customerId = cust?.id || cust?.data?.[0]?.id;
    if (!customerId) return json({ error: "Missing Asaas customer id", detail: cust }, { status: 502 }, origin);

    // 3b) Create payment (set externalReference = reservationId)
    const payRes = await fetch(`${ASAAS_BASE}/payments`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify({
        customer: customerId,
        value: value,
        billingType: "PIX",
        externalReference: reservationId,
        dueDate: dueDate,
        description: description || "Compra de bilhetes",
      }),
    });
    const pay = await payRes.json();
    if (!payRes.ok) {
      return json({ error: "Asaas payment error", detail: pay }, { status: payRes.status }, origin);
    }

    const payment_id = pay?.id;
    if (!payment_id) return json({ error: "Missing payment id", detail: pay }, { status: 502 }, origin);

    // 3c) Get PIX QR
    const qrRes = await fetch(`${ASAAS_BASE}/payments/${payment_id}/pixQrCode`, {
      method: "GET",
      headers: asaasHeaders,
    });
    const qrRaw = await qrRes.json();
    if (!qrRes.ok) {
      return json({ error: "Asaas QR error", detail: qrRaw }, { status: qrRes.status }, origin);
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
    }, {}, origin);
  },
};