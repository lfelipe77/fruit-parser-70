import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }});

const ALLOWED = new Set([
  "https://ganhavel.com",
  "https://www.ganhavel.com",
  "http://localhost:5173",
  "http://localhost:3000",
]);
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ALLOWED.has(origin) ? origin : "*",
  "Vary": "Origin",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
});

type Body = { reservation_id?: string; asaas_payment_id?: string };

function toFiveSingles(anyShape: unknown): string[] {
  const txt = typeof anyShape === "string" ? anyShape : JSON.stringify(anyShape ?? "");
  const matches = txt.match(/\d{2}/g) ?? [];
  const out = [0,1,2,3,4].map(i => (matches[i] ?? "00").padStart(2,"0"));
  return out as string[];
}

serve(async (req) => {
  const headers = cors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok:false, reason:"method_not_allowed" }), { status: 405, headers });
    }

    const raw = await req.json().catch(() => ({}));
    const reservation_id   = (raw as any).reservation_id   ?? (raw as any).reservationId;
    const asaas_payment_id = (raw as any).asaas_payment_id ?? (raw as any).asaasPaymentId;

    if (!reservation_id || !asaas_payment_id) {
      return new Response(JSON.stringify({
        ok:false,
        reason:"bad_request",
        detail:`Missing keys. Got keys=${Object.keys(raw as any).join(",")}. Expect reservation_id|reservationId and asaas_payment_id|asaasPaymentId`
      }), { status: 400, headers });
    }

    // 1) Assert PAID in payments_pending
    const { data: pending, error: pendErr } = await sb
      .from("payments_pending")
      .select("reservation_id, asaas_payment_id, status, amount")
      .eq("reservation_id", reservation_id)
      .eq("asaas_payment_id", asaas_payment_id)
      .maybeSingle();
    if (pendErr) throw pendErr;
    if (!pending || pending.status !== "PAID") {
      return new Response(JSON.stringify({ ok:false, reason:"not_paid" }), { status: 409, headers });
    }

    // Idempotency: if tx exists, short-circuit
    const { data: existingTx, error: txCheckErr } = await sb
      .from("transactions")
      .select("id")
      .eq("reservation_id", reservation_id)
      .limit(1)
      .maybeSingle();
    if (txCheckErr) throw txCheckErr;
    if (existingTx?.id) {
      return new Response(JSON.stringify({ ok:true, idempotent:true, transaction_id: existingTx.id }), { status: 200, headers });
    }

    // 2) Canon: RESERVED tickets for this reservation
    const { data: reserved, error: resErr } = await sb
      .from("tickets")
      .select("reservation_id, raffle_id, user_id, ticket_number")
      .eq("reservation_id", reservation_id)
      .eq("status", "reserved")
      .order("ticket_number", { ascending: true });
    if (resErr) throw resErr;

    let raffle_id: string | null = null;
    let buyer_user_id: string | null = null;
    let numbers5: string[] | null = null;

    if (reserved && reserved.length > 0) {
      raffle_id = reserved[0].raffle_id as unknown as string;
      buyer_user_id = reserved[0].user_id as unknown as string;
      const singles = reserved.map(r => String(r.ticket_number).padStart(2,"0"));
      numbers5 = toFiveSingles(singles);
    } else {
      // Fallback to reservation_* views (service role bypasses RLS)
      const [vu, va, vt] = await Promise.all([
        sb.from("reservation_unpaid_v1").select("*").eq("reservation_id", reservation_id).maybeSingle(),
        sb.from("reservation_audit_v1").select("*").eq("reservation_id", reservation_id).maybeSingle(),
        sb.from("reservation_tickets_v1").select("*").eq("reservation_id", reservation_id).maybeSingle(),
      ]);
      const v = vu.data ?? va.data ?? vt.data ?? null;
      if (!v) {
        return new Response(JSON.stringify({ ok:false, reason:"canon_missing" }), { status: 500, headers });
      }
      raffle_id = (v.raffle_id ?? null) as string | null;
      buyer_user_id = (v.buyer_user_id ?? v.user_id ?? null) as string | null;
      numbers5 = toFiveSingles(v.numbers ?? null);
    }

    // 3) UPDATE-then-INSERT into transactions (no upsert because reservation_id is not unique)
    let txId: string | null = null;

    // Try update by reservation
    const { data: updTx, error: updErr } = await sb
      .from("transactions")
      .update({
        status: "paid",
        provider: "asaas",
        provider_payment_id: asaas_payment_id,
        numbers: numbers5,
      })
      .eq("reservation_id", reservation_id)
      .select("id")
      .maybeSingle();
    if (updErr) throw updErr;
    txId = updTx?.id ?? null;

    // If nothing updated, insert
    if (!txId) {
      const { data: insTx, error: insErr } = await sb
        .from("transactions")
        .insert({
          raffle_id,
          reservation_id,
          buyer_user_id,
          status: "paid",
          provider: "asaas",
          provider_payment_id: asaas_payment_id,
          numbers: numbers5,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;
      txId = insTx.id;
    }

    // 4) Fill amount from payments_pending if missing/<=0
    const { data: txRow, error: getTxErr } = await sb
      .from("transactions")
      .select("id, amount")
      .eq("id", txId!)
      .single();
    if (getTxErr) throw getTxErr;

    if (!txRow.amount || Number(txRow.amount) <= 0) {
      const { error: amtErr } = await sb
        .from("transactions")
        .update({ amount: pending.amount })
        .eq("id", txId!);
      if (amtErr) throw amtErr;
    }

    // 5) Ensure aggregate PAID ticket row exists
    const { data: paidTk, error: paidCheckErr } = await sb
      .from("tickets")
      .select("id")
      .eq("transaction_id", txId!)
      .maybeSingle();
    if (paidCheckErr) throw paidCheckErr;

    if (!paidTk) {
      const { error: insTkErr } = await sb.from("tickets").insert({
        transaction_id: txId!,
        raffle_id,
        user_id: buyer_user_id,
        status: "paid",
        reservation_id,
        numbers: numbers5,
      });
      if (insTkErr) throw insTkErr;
    }

    return new Response(JSON.stringify({ ok:true, transaction_id: txId }), { status: 200, headers });
  } catch (e: any) {
    console.error("finalize-payment error:", e);
    return new Response(JSON.stringify({ ok:false, reason:"db_error", detail:String(e?.message ?? e) }), { status: 500, headers });
  }
});