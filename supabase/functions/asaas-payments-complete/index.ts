import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.53.0?target=deno";

// Admin client for DB writes (service role)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// === CPF/CNPJ validation helpers ===
type PersonType = 'FISICA' | 'JURIDICA';

const onlyDigits = (s?: unknown) => String(s ?? '').replace(/\D/g, '');

function isValidCPF(raw: string): boolean {
  const cpf = onlyDigits(raw);
  
  // Must be exactly 11 digits
  if (cpf.length !== 11) return false;
  
  // Reject repeated digits (111.111.111-11, 222.222.222-22, etc.)
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== parseInt(cpf[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;
  if (secondDigit !== parseInt(cpf[10])) return false;
  
  return true;
}

function resolveCpfCnpj(opts: {
  profileTaxId?: string | null;
  formDoc?: string | null;
  validateMode?: 'strict' | 'loose'; // strict by default for production
}) {
  const fromForm = onlyDigits(opts.formDoc);
  const fromProfile = onlyDigits(opts.profileTaxId);
  const chosen = fromForm || fromProfile || '';
  const len = chosen.length;
  const personType = len === 14 ? 'JURIDICA' : 'FISICA'; // fallback FISICA

  console.log('[asaas] cpfCnpj.check', { 
    fromForm, 
    fromProfile, 
    chosen, 
    len, 
    validateMode: opts.validateMode 
  });

  if (opts.validateMode === 'strict') {
    if (len === 11) {
      // Strict CPF validation
      if (!isValidCPF(chosen)) {
        const err = new Error('Documento inválido (CPF).');
        (err as any).status = 400;
        (err as any).code = 'INVALID_DOCUMENT';
        throw err;
      }
    } else if (len === 14) {
      // For CNPJ, just check length (could add full CNPJ validation later)
      // For now, accept any 14-digit sequence
    } else {
      const err = new Error('Documento inválido (CPF).');
      (err as any).status = 400;
      (err as any).code = 'INVALID_DOCUMENT';
      throw err;
    }
  }
  // loose mode: return whatever we have (may be empty), let Asaas decide
  return { cpfCnpj: chosen, len, personType };
}
function sanitizeBRPhone(raw?: unknown): string | null {
  if(raw==null) return null; let d=String(raw).replace(/\D+/g,'');
  if(d.startsWith('55') && (d.length===12||d.length===13)) d=d.slice(2);
  return (d.length===10||d.length===11)? d : null;
}
function dueDateSP(): string {
  const p=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const y=p.find(x=>x.type==='year')!.value, m=p.find(x=>x.type==='month')!.value, d=p.find(x=>x.type==='day')!.value;
  return `${y}-${m}-${d}`;
}

function toAmount(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.round(raw * 100) / 100;
  }
  if (typeof raw === 'string') {
    const s = raw.trim();
    // accept "10,00" OR "10.00" (no thousands). If it has a comma and no dot, swap comma->dot.
    const normalized = (s.includes(',') && !s.includes('.')) ? s.replace(',', '.') : s;
    const n = Number(normalized);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100) / 100;
  }
  return null;
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info, x-request-id',
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
    const url = new URL(req.url);
    const validateParam = (url.searchParams.get('validate') || 'strict') as 'strict' | 'loose';

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return withCORS(new Response(null, { status: 204 }), origin);
    }

    if (req.method !== 'POST') {
      return json({ ok: false, error: 'Method Not Allowed' }, { status: 405 }, origin);
    }

    try {
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

      // --- SAFER REQUEST PARSE ---
      const contentType = req.headers.get('content-type') || '';
      let rawBody = '';
      try {
        rawBody = await req.text();
      } catch (e) {
        return json({ error: 'Failed to read request body', detail: String(e) }, { status: 400 }, origin);
      }

      if (!rawBody) {
        return json({ error: 'Empty request body' }, { status: 400 }, origin);
      }

      if (!contentType.toLowerCase().includes('application/json')) {
        return json({ error: 'Unsupported Media Type. Use application/json' }, { status: 415 }, origin);
      }

      let payload: { reservationId?: string; value?: number; description?: string; customer?: any } = {};
      try {
        payload = JSON.parse(rawBody);
      } catch (e) {
        return json({ error: 'Invalid JSON', rawBody }, { status: 400 }, origin);
      }

      const { reservationId, value, description } = payload;
      if (!reservationId || typeof value !== 'number') {
        return json({ error: 'Invalid payload: reservationId (string) and value (number) are required.' }, { status: 400 }, origin);
      }

      const MIN = Number(Deno.env.get('MIN_PIX_VALUE') ?? '5');
      if (value < MIN) {
        return json({ error: `Valor mínimo para PIX é R$ ${MIN.toFixed(2)}.` }, { status: 422 }, origin);
      }

      // 3) Fetch profile and validate CPF/CNPJ
      const { data: profile, error: profErr } = await sb
        .from('user_profiles').select('id,full_name,tax_id').eq('id', user.id).maybeSingle();
      if (profErr) {
        console.warn('[asaas] profile fetch error (continuing with form data):', profErr);
      }


      // Resolve and validate document with new flexible approach
      const { customer_name, customer_phone, customer_cpf } = payload?.customer ?? {};
      let cpfCnpj: string, len: number, personType: PersonType;
      try {
        const r = resolveCpfCnpj({
          profileTaxId: profile?.tax_id,
          formDoc: customer_cpf,
          validateMode: validateParam,
        });
        cpfCnpj = r.cpfCnpj; 
        len = r.len; 
        personType = r.personType as PersonType;
      } catch (e: any) {
        return json({ 
          ok: false, 
          error: e.message, 
          code: e.code || 'VALIDATION_ERROR',
          _where: 'precheck' 
        }, { status: e.status || 400 }, origin);
      }

      const mobilePhone = sanitizeBRPhone(profile?.phone ?? customer_phone ?? null);

      // 4) Prepare Asaas requests and create payment
      const ASAAS_KEY_RAW = (Deno.env.get('ASAAS_API_KEY') ?? '').trim();
      const ASAAS_BASE = (Deno.env.get('ASAAS_BASE') ?? Deno.env.get('ASAAS_BASE_URL') ?? 'https://api.asaas.com/v3').trim();

      if (!ASAAS_KEY_RAW) {
        return json({ error: 'Missing ASAAS_API_KEY' }, { status: 500 }, origin);
      }
      const isSandboxKey = ASAAS_KEY_RAW.includes('_hmlg_') || ASAAS_KEY_RAW.startsWith('aact_hmlg_');
      const isSandboxBase = ASAAS_BASE.includes('sandbox.asaas.com');

      if (isSandboxKey && !isSandboxBase) {
        return json({ error: 'Sandbox key used with production base', hint: 'Set ASAAS_BASE=https://sandbox.asaas.com/api/v3' }, { status: 400 }, origin);
      }
      if (!isSandboxKey && isSandboxBase) {
        return json({ error: 'Production key used with sandbox base', hint: 'Remove sandbox base or use sandbox key' }, { status: 400 }, origin);
      }

      const ASAAS_API_KEY = ASAAS_KEY_RAW;

      // small helper to mask keys in logs/responses
      const mask = (s: string) => s.length <= 8 ? '***' : (s.slice(0,4) + '...' + s.slice(-4));

      // 1) Before fetch, include a debug echo
      const debug = {
        asaasBase: ASAAS_BASE,
        keyMask: mask(ASAAS_API_KEY),
        headerName: 'access_token'
      };

      // 2) Build headers EXACTLY as Asaas expects
      const headers = new Headers();
      headers.set('access_token', ASAAS_API_KEY);
      headers.set('Content-Type','application/json');

      // Helper: text-first fetch with robust error context
      async function asaasCall(path: string, init: RequestInit = {}) {
        const h = new Headers(headers);
        const extra = new Headers(init.headers ?? {});
        extra.forEach((v,k)=>h.set(k,v));
        const resp = await fetch(`${ASAAS_BASE}${path}`, { ...init, headers: h });
        const text = await resp.text();
        let parsed: unknown = null; try { parsed = text ? JSON.parse(text) : null; } catch {}
        return { resp, text, parsed };
      }

      // Prepare customer payload with validated document
      const customerPayload: any = {
        name: profile?.full_name || customer_name || 'Cliente',
        cpfCnpj: cpfCnpj || undefined,     // allow empty in loose mode; Asaas will respond
        personType,
        email: user.email,
        ...(mobilePhone ? { mobilePhone } : {}),
        externalReference: user.id,
      };

      console.log('[asaas] customer payload (preview)', { ...customerPayload, cpfCnpj_len: len });
      const cust = await asaasCall('/customers', { method:'POST', body: JSON.stringify(customerPayload) });
      if (!cust.resp.ok) {
        const msg = cust.parsed?.errors?.[0]?.description
                || cust.parsed?.message
                || cust.text
                || 'Falha ao criar cliente';
        console.warn('[asaas] customer creation error', cust.parsed ?? cust.text);
        return json({ ok: false, error: msg, _where: 'asaas' }, { status: 400 }, origin);
      }
      const customerId = (cust.parsed as any)?.id || (cust.parsed as any)?.data?.[0]?.id;
      if (!customerId) {
        return json({ error: 'Missing Asaas customer id', body: cust.text, debug }, { status: 502 }, origin);
      }

      const APP_BASE_URL = Deno.env.get('APP_BASE_URL') ?? 'https://ganhavel.com';
      const successUrl = `${APP_BASE_URL}/?pix=success&reservationId=${encodeURIComponent(reservationId)}`;

      const payBody = {
        customer: customerId,
        value,
        description: description ?? 'Compra de bilhetes',
        billingType: 'PIX',
        dueDate: dueDateSP(),
        externalReference: reservationId,
        postalService: false,
        callback: {
          successUrl,
          autoRedirect: true
        }
      };
      const pay = await asaasCall('/payments', { method:'POST', body: JSON.stringify(payBody) });
      if (!pay.resp.ok) {
        const msg = pay.parsed?.errors?.[0]?.description
                || pay.parsed?.message
                || pay.text
                || 'Falha ao criar cobrança';
        console.warn('[asaas] payment creation error', pay.parsed ?? pay.text);
        return json({ ok: false, error: msg, _where: 'asaas' }, { status: 400 }, origin);
      }
      const payment_id = (pay.parsed as any)?.id;
      if (!payment_id) {
        return json({ error: 'Missing payment id', body: pay.text, debug }, { status: 502 }, origin);
      }
      const invoiceUrl = (pay.parsed as any)?.invoiceUrl ?? null;

      const qr = await asaasCall(`/payments/${payment_id}/pixQrCode`, { method:'GET' });
      if (!qr.resp.ok) {
        const msg = qr.parsed?.errors?.[0]?.description
                || qr.parsed?.message
                || qr.text
                || 'Falha ao gerar QR Code';
        console.warn('[asaas] QR code generation error', qr.parsed ?? qr.text);
        return json({ ok: false, error: msg, _where: 'asaas' }, { status: 400 }, origin);
      }
      const qrRaw: any = qr.parsed || {};
      const base64 = qrRaw?.encodedImage ?? qrRaw?.image ?? '';
      const encodedImage = base64 && String(base64).startsWith('data:') ? base64 : (base64 ? `data:image/png;base64,${base64}` : '');
      const payloadCode = qrRaw?.payload ?? qrRaw?.payloadCode ?? qrRaw?.qrCodeText ?? null;

      // Capture IDs and PIX fields
      const asaasPaymentId = payment_id;
      const qrCodeImage = encodedImage;
      const pixPayload = payloadCode;
      const expiresAtIso = qrRaw?.expiresAt ?? qrRaw?.expirationDate ?? null;

      // Idempotent upsert into payments_pending (service role)
      const { data: pendingRow, error: pendingErr } = await admin
        .from('payments_pending')
        .upsert({
          reservation_id: reservationId,
          asaas_payment_id: asaasPaymentId,
          amount: Number(value),
          status: 'PENDING',
          expires_at: expiresAtIso ?? new Date(Date.now() + 30*60*1000).toISOString()
        }, { onConflict: 'reservation_id' })
        .select('reservation_id, asaas_payment_id, status, expires_at')
        .single();

      if (pendingErr) {
        // Still return QR so user can pay
        return json({
          ok: true,
          warning: 'Failed to insert payments_pending',
          pendingError: pendingErr,
          reservationId,
          paymentId: asaasPaymentId,
          qrCode: qrCodeImage,
          payload: pixPayload,
          expiresAt: expiresAtIso ?? null,
          // keep backward-compat fields
          payment_id,
          qr: { encodedImage: qrCodeImage, payload: pixPayload, expiresAt: expiresAtIso ?? null },
          value,
          debug,
          invoiceUrl
        }, { status: 200 }, origin);
      }

      // Success response
      return json({
        ok: true,
        reservationId,
        paymentId: asaasPaymentId,
        qrCode: qrCodeImage,
        payload: pixPayload,
        expiresAt: expiresAtIso ?? null,
        // keep backward-compat fields
        payment_id,
        qr: { encodedImage: qrCodeImage, payload: pixPayload, expiresAt: expiresAtIso ?? null },
        value,
        debug,
        invoiceUrl
      }, { status: 200 }, origin);
    } catch (err) {
      console.error('[asaas-payments-complete] error', err);
      return json({ error: String(err) }, { status: 500 }, origin);
    }
  },
};