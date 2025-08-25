import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Compact Brazilian document validation helpers
function onlyDigits(v?: unknown){ return typeof v === 'string' ? v.replace(/\D+/g,'') : ''; }
function isValidCPF(raw?: unknown){ const v=onlyDigits(raw); if(v.length!==11||/^(\d)\1{10}$/.test(v))return false;
  let s=0; for(let i=0;i<9;i++) s+=Number(v[i])*(10-i); let d1=(s*10)%11; if(d1===10)d1=0; if(d1!==Number(v[9])) return false;
  s=0; for(let i=0;i<10;i++) s+=Number(v[i])*(11-i); let d2=(s*10)%11; if(d2===10)d2=0; return d2===Number(v[10]); }
function isValidCNPJ(raw?: unknown){ const v=onlyDigits(raw); if(v.length!==14||/^(\d)\1{13}$/.test(v))return false;
  const calc=(len:number)=>{const w=len===12?[5,4,3,2,9,8,7,6,5,4,3,2]:[6,5,4,3,2,9,8,7,6,5,4,3,2];
    let s=0; for(let i=0;i<w.length;i++) s+=Number(v[i])*w[i]; const m=s%11; return m<2?0:11-m;};
  const d1=calc(12); if(d1!==Number(v[12])) return false; const d2=calc(13); return d2===Number(v[13]); }
type PersonType='FISICA'|'JURIDICA';
function normalizeCpfCnpjOrNull(raw?: unknown):{digits:string;type:PersonType}|null{
  const d=onlyDigits(typeof raw==='string' && raw.toLowerCase()!=='null'?raw:null);
  if(!d) return null; if(isValidCPF(d)) return {digits:d,type:'FISICA'}; if(isValidCNPJ(d)) return {digits:d,type:'JURIDICA'}; return null;
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

    // 2) Parse input and validate minimum value
    const body = await req.json().catch(()=>({}));
    console.log('[PIX] in', { hasJWT: !!jwt, bodyKeys: Object.keys(body||{}) });

    const rawReservationId = body?.reservationId ?? body?.reservation_id ?? null;
    const rawValue = body?.value ?? body?.amount ?? null;
    const reservationId = (typeof rawReservationId === 'string' && rawReservationId) ? rawReservationId : null;
    const value = toAmount(rawValue);
    const description = body?.description ?? 'Compra de bilhetes';

    console.log('[PIX] mapped', { reservationId, valueType: typeof rawValue, rawValue, value });
    if (!reservationId || value === null) {
      return json({ error: 'Missing required fields: reservationId and value' }, { status: 400 }, origin);
    }

    const MIN = Number(Deno.env.get('MIN_PIX_VALUE') ?? '5');
    if (value < MIN) {
      return json({ error: `Valor mínimo para PIX é R$ ${MIN.toFixed(2)}.` }, { status: 422 }, origin);
    }

    // 3) Fetch profile and validate CPF/CNPJ
    const { data: profile, error: profErr } = await sb
      .from('user_profiles').select('id,tax_id').eq('id', user.id).single();
    if (profErr || !profile) return json({ error:'Profile not found' }, { status:404 }, origin);

    const doc = normalizeCpfCnpjOrNull(profile.tax_id);
    if (!doc) return json({ error:'Documento inválido. Atualize seu CPF/CNPJ no perfil.' }, { status:422 }, origin);
    const mobilePhone = sanitizeBRPhone(body?.customer?.phone ?? null);

    // 4) Prepare Asaas requests and create payment
    const ASAAS_BASE_URL = Deno.env.get('ASAAS_BASE_URL') ?? 'https://api.asaas.com/v3';
    const ASAAS_API_KEY  = Deno.env.get('ASAAS_API_KEY') || '';
    console.log('[PIX] asaas env', { base: ASAAS_BASE_URL, keyPrefix: ASAAS_API_KEY ? ASAAS_API_KEY.slice(0,6) : '(none)' });
    async function asaasFetch(path: string, init: RequestInit = {}) {
      const base = Deno.env.get('ASAAS_BASE_URL') ?? 'https://api.asaas.com/v3';
      const key  = Deno.env.get('ASAAS_API_KEY')!;
      const headers = new Headers(init.headers ?? {});
      headers.set('content-type','application/json');
      headers.set('access_token', key);
      return fetch(`${base}${path}`, { ...init, headers });
    }
    const customerPayload:any = {
      name: body?.customer?.name ?? 'Cliente',
      email: body?.customer?.email ?? undefined,
      ...(mobilePhone ? { mobilePhone } : {}),
      cpfCnpj: doc.digits,
      personType: doc.type,
      externalReference: user.id,
    };
    const custRes = await asaasFetch('/customers', { method:'POST', body: JSON.stringify(customerPayload) });
    const cust = await custRes.json(); if(!custRes.ok) return json({ error:'Asaas customer error', detail:cust }, { status:custRes.status }, origin);
    const customerId = cust?.id || cust?.data?.[0]?.id; if(!customerId) return json({ error:'Missing Asaas customer id', detail:cust }, { status:502 }, origin);

    const payBody = {
      customer: customerId,
      value,
      description,
      billingType: 'PIX',
      dueDate: dueDateSP(),
      externalReference: reservationId,
      postalService: false,
    };
    const payRes = await asaasFetch('/payments', { method:'POST', body: JSON.stringify(payBody) });
    const pay = await payRes.json(); if(!payRes.ok) return json({ error:'Asaas payment error', detail:pay }, { status:payRes.status }, origin);
    const payment_id = pay?.id; if(!payment_id) return json({ error:'Missing payment id', detail: pay }, { status:502 }, origin);

    const qrRes = await asaasFetch(`/payments/${payment_id}/pixQrCode`, { method:'GET' });
    const qrRaw = await qrRes.json(); if(!qrRes.ok) return json({ error:'Asaas QR error', detail: qrRaw }, { status:qrRes.status }, origin);
    const base64 = qrRaw?.encodedImage ?? qrRaw?.image ?? '';
    const encodedImage = base64 && String(base64).startsWith('data:') ? base64 : (base64 ? `data:image/png;base64,${base64}` : '');
    const payload = qrRaw?.payload ?? qrRaw?.payloadCode ?? qrRaw?.qrCodeText ?? null;

    return json({ ok:true, payment_id, qr:{ encodedImage, payload, expiresAt: qrRaw?.expiresAt ?? qrRaw?.expirationDate ?? null }, value }, { status:200 }, origin);
  },
};