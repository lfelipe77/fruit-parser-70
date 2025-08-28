// Polls Asaas for a PIX payment tied to a reservation and finalizes the purchase when paid.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ---- Defaults for quick testing if caller omits them ----
const DEFAULT_RES_ID = "5eb26722-5154-42c2-bd6b-73df81684092";
const DEFAULT_PIX_ID = "LUIZFELI00000511984892ASA";
// ---------------------------------------------------------

type PendingRow = {
  reservation_id: string;
  pix_qr_code_id: string | null;
  asaas_payment_id: string | null;
  status: string | null;
  amount: number | string | null;
  updated_at?: string;
};

type AsaasPayment = {
  id: string;
  status: string; // RECEIVED | CONFIRMED | ...
  value: number;
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders },
  });
}

function toNumber(n: unknown): number | null {
  if (n === null || n === undefined) return null;
  const num = Number(n);
  return Number.isFinite(num) ? num : null;
}

function eqMoney(a: number, b: number, centsTol = 0.005) {
  return Math.abs(a - b) < centsTol;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const debug = url.searchParams.get("debug") === "1";

  // Env
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY")!;
  const ASAAS_SUBACCOUNT_ID = Deno.env.get("ASAAS_SUBACCOUNT_ID") || null;
  const ASAAS_BASE =
    (Deno.env.get("ASAAS_BASE") || "https://api.asaas.com/v3").replace(/\/+$/, "");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return respond({ error: "Missing Supabase service env" }, 500);
  }
  if (!ASAAS_API_KEY) {
    return respond({ error: "Missing ASAAS_API_KEY secret" }, 500);
  }

  // Inputs
  let body: any = null;
  if (req.method.toUpperCase() === "POST") {
    try { body = await req.json(); } catch { body = null; }
  }

  const reservationId =
    body?.reservationId ||
    url.searchParams.get("reservationId") ||
    url.searchParams.get("id") ||
    DEFAULT_RES_ID;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    global: { headers: { "x-fn": "payment-status" } },
  });

  // 1) Fetch pending row
  const { data: pending, error: pendErr } = await supabase
    .from("payments_pending")
    .select("reservation_id, pix_qr_code_id, asaas_payment_id, status, amount, updated_at")
    .eq("reservation_id", reservationId)
    .maybeSingle<PendingRow>();

  if (pendErr) return respond({ error: "DB error fetching pending", details: pendErr.message }, 500);
  if (!pending) return respond({ error: "Reservation not found", reservationId }, 404);

  const currentStatus = (pending.status || "").toUpperCase();
  if (currentStatus === "PAID" || pending.asaas_payment_id) {
    return respond({ status: "PAID", reservationId, asaasPaymentId: pending.asaas_payment_id, alreadyPaid: true });
  }

  const pixQrCodeId =
    body?.pixQrCodeId ||
    url.searchParams.get("pixQrCodeId") ||
    pending.pix_qr_code_id ||
    DEFAULT_PIX_ID;

  if (!pixQrCodeId) {
    return respond({ status: "PENDING", reservationId, note: "No pix_qr_code_id available yet for this reservation." });
  }

  // 2) Ask Asaas about payments for this QR
  const headers = new Headers();
  headers.set("access_token", ASAAS_API_KEY); // Asaas auth (NOT Bearer)
  headers.set("User-Agent", "GanhavelApp/1.0 (+https://ganhavel.com)");
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (ASAAS_SUBACCOUNT_ID) headers.set("access_token_subaccount", ASAAS_SUBACCOUNT_ID);

  const asaasUrl = `${ASAAS_BASE}/payments?pixQrCodeId=${encodeURIComponent(pixQrCodeId)}`;
  const asaasResp = await fetch(asaasUrl, { headers, method: "GET" });

  if (!asaasResp.ok) {
    const raw = await asaasResp.text().catch(() => "");
    if (debug) {
      return respond({
        status: "PENDING",
        reservationId,
        pixQrCodeId,
        asaasError: { httpStatus: asaasResp.status, body: raw?.slice(0, 2000) ?? "" },
      });
    }
    return respond({ status: "PENDING", reservationId });
  }

  let asaasJson: { data?: AsaasPayment[] } = {};
  try { asaasJson = await asaasResp.json(); } catch { asaasJson = {}; }
  const payments = (asaasJson?.data || []) as AsaasPayment[];

  // 3) Qualifying payment (status + amount if available)
  const okStatuses = new Set(["RECEIVED", "CONFIRMED"]);
  const expected = toNumber(pending.amount);

  const paidPayment = payments.find((p) => {
    if (!okStatuses.has((p.status || "").toUpperCase())) return false;
    if (expected === null) return true;
    const val = toNumber(p.value);
    return val !== null && eqMoney(val, expected);
  });

  if (!paidPayment) {
    if (debug) {
      return respond({
        status: "PENDING",
        reservationId,
        pixQrCodeId,
        expectedAmount: expected,
        seenPayments: payments.map((p) => ({ id: p.id, status: p.status, value: p.value })),
      });
    }
    return respond({ status: "PENDING", reservationId });
  }

  // 4) Flip payments_pending → PAID
  const { error: updErr } = await supabase
    .from("payments_pending")
    .update({ status: "PAID", asaas_payment_id: paidPayment.id, updated_at: new Date().toISOString() })
    .eq("reservation_id", reservationId);

  if (updErr) {
    return respond({
      error: "Failed to update payments_pending to PAID",
      reservationId,
      details: updErr.message,
      asaasPayment: { id: paidPayment.id, status: paidPayment.status, value: paidPayment.value },
    }, 500);
  }

  // 5) Finalize purchase (support two common param name variants)
  const finalizeAttempt = async () => {
    let rv = await supabase.rpc("finalize_paid_purchase", {
      reservation_id: reservationId,
      provider_payment_id: paidPayment.id,
      extra1: null, extra2: null, extra3: null,
    } as any);
    if (!rv.error) return rv;
    rv = await supabase.rpc("finalize_paid_purchase", {
      p_reservation_id: reservationId,
      p_provider_payment_id: paidPayment.id,
      p_extra1: null, p_extra2: null, p_extra3: null,
    } as any);
    return rv;
  };

  const { data: finalizeData, error: finalizeErr } = await finalizeAttempt();

  if (finalizeErr) {
    return respond({
      error: "Marked as PAID but finalize_paid_purchase failed",
      reservationId,
      details: finalizeErr.message,
      asaasPayment: { id: paidPayment.id, status: paidPayment.status, value: paidPayment.value },
    }, 500);
  }

  if (debug) {
    return respond({
      status: "PAID",
      reservationId,
      pixQrCodeId,
      asaasPaymentId: paidPayment.id,
      seenPayments: payments.map((p) => ({ id: p.id, status: p.status, value: p.value })),
      finalize: finalizeData,
    });
  }

  return respond({ status: "PAID", reservationId, asaasPaymentId: paidPayment.id });
});
