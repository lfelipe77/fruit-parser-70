import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://ganhavel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId") ?? undefined;
    const reservationIdParam = url.searchParams.get("reservationId") ?? undefined;
    const debug = url.searchParams.get("debug") === "1";

    // Accept POST body for fallback data
    let body: any = null;
    if (req.method === 'POST') {
      try { 
        body = await req.json(); 
      } catch {}
    }
    // Use reservation from params or body
    let reservationId = reservationIdParam || body?.reservationId || '' as string;
    if (!reservationId && !paymentId) {
      return new Response(JSON.stringify({ error: "Missing paymentId or reservationId" }), { status: 400, headers: corsHeaders });
    }

    // Auth (user JWT required)
    const auth = req.headers.get("authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing Authorization Bearer token" }), { status: 401, headers: corsHeaders });
    }
    const jwt = auth.slice(7);

    // User client (RLS enforced)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), { status: 401, headers: corsHeaders });
    }

    // --- Resolve reservation/payment and enforce ownership, then use admin for reads ---
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let pending: any = null;

    // If we only have paymentId, try to resolve reservation via user RLS first, then fallback to admin
    if (!reservationId && paymentId) {
      const { data: ppUser } = await userClient
        .from("payments_pending")
        .select("reservation_id, asaas_payment_id, status, expires_at, amount")
        .eq("asaas_payment_id", paymentId)
        .maybeSingle();
      if (ppUser) {
        pending = ppUser;
        reservationId = ppUser.reservation_id;
      }
    }

    if (!reservationId && paymentId) {
      const { data: ppAdmin } = await admin
        .from("payments_pending")
        .select("reservation_id, asaas_payment_id, status, expires_at, amount")
        .eq("asaas_payment_id", paymentId)
        .maybeSingle();
      if (ppAdmin) {
        pending = ppAdmin;
        reservationId = ppAdmin.reservation_id;
      }
    }

    if (!reservationId) {
      return new Response(JSON.stringify({ status: "UNKNOWN", reservationId: null, paymentId: paymentId ?? null }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Ownership check (strict): ensure the authenticated user owns this reservation
    const { data: own } = await userClient
      .from("tickets")
      .select("reservation_id")
      .eq("reservation_id", reservationId)
      .limit(1)
      .maybeSingle();

    if (!own) {
      return new Response(
        JSON.stringify({ status: "UNKNOWN", reservationId, paymentId: paymentId ?? null, reason: "not_owner" }),
        { status: 200, headers: corsHeaders },
      );
    }

    // find pending by reservation
    const { data: pendingData } = await admin
      .from('payments_pending')
      .select('reservation_id, pix_qr_code_id, amount, status')
      .eq('reservation_id', reservationId)
      .maybeSingle();

    // fallback to body pixQrCodeId when DB row missing (rare)
    const qrId = pendingData?.pix_qr_code_id ?? body?.pixQrCodeId;
    if (!qrId) return new Response(JSON.stringify({ status:'UNKNOWN', reservationId, reason:'no_pix_qr_code_id' }), { headers: corsHeaders });

    pending = pendingData;

    if (!reservationId) {
      return new Response(JSON.stringify({ status: "UNKNOWN", reservationId: null, paymentId: paymentId ?? null }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    // --- Already verified via transactions table? (admin bypasses RLS) ---
    const { data: tx } = await admin
      .from("transactions")
      .select("id, provider_payment_id")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tx) {
      return new Response(
        JSON.stringify({ status: "PAID", reservationId, paymentId: tx.provider_payment_id }),
        { status: 200, headers: corsHeaders },
      );
    }

    // --- Live check at Asaas using qrId ---
    if (qrId) {
      const ASAAS_BASE = Deno.env.get("ASAAS_BASE") ?? "https://api.asaas.com/v3";
      const headers = new Headers();
      headers.set('access_token', Deno.env.get('ASAAS_API_KEY')!);
      const sub = Deno.env.get('ASAAS_SUBACCOUNT_ID');
      if (sub) headers.set('access_token_subaccount', sub);

      // poll Asaas by pixQrCodeId
      const r = await fetch(`${ASAAS_BASE}/payments?pixQrCodeId=${qrId}`, { headers });
      if (!r.ok) {
        if (debug) {
          const raw = await r.text();
          return new Response(
            JSON.stringify({ status: 'PENDING', reservationId, pixQrCodeId: qrId, asaasError: { httpStatus: r.status, body: raw } }),
            { headers: corsHeaders }
          );
        }
        return new Response(JSON.stringify({ status: 'PENDING', reservationId }), { headers: corsHeaders });
      }

      const j = await r.json();
      const paid = (j?.data || []).find((p:any) =>
        (p.status === 'RECEIVED' || p.status === 'CONFIRMED') &&
        Number(p.value) === Number(pending?.amount ?? body?.amount)
      );

      if (!paid) return new Response(JSON.stringify({ status:'PENDING', reservationId }), { headers: corsHeaders });

      // 1) mark pending as PAID + set asaas_payment_id
      await admin.from('payments_pending').update({
        status: 'PAID',
        asaas_payment_id: paid.id,
        updated_at: new Date().toISOString()
      }).eq('reservation_id', reservationId);

        // Check if transaction already exists to avoid duplicate finalization
        const { data: hasTx } = await admin
          .from("transactions")
          .select("id")
          .eq("provider_payment_id", paid.id)
          .limit(1)
          .maybeSingle();

        if (!hasTx) {
          // Lookup buyer by reservation and fetch profile CPF server-side
          const { data: buyer } = await admin
            .from('tickets')
            .select('user_id')
            .eq('reservation_id', reservationId)
            .limit(1)
            .maybeSingle();

          let profileCpf: string | null = null;
          let profileName: string | null = null;
          let profilePhone: string | null = null;
          if (buyer?.user_id) {
            const { data: profile } = await admin
              .from('user_profiles')
              .select('tax_id, full_name, phone')
              .eq('id', buyer.user_id)
              .limit(1)
              .maybeSingle();
            profileCpf = profile?.tax_id ?? null;
            profileName = profile?.full_name ?? null;
            profilePhone = profile?.phone ?? null;
          }
          
          // 2) finalize (idempotent)
          await admin.rpc('finalize_paid_purchase', {
            p_reservation_id: reservationId,
            p_asaas_payment_id: paid.id,
            p_customer_name: body?.customer_name ?? null,
            p_customer_phone: body?.customer_phone ?? null,
            p_customer_cpf: body?.customer_cpf ?? null
          });
        }

      return new Response(JSON.stringify({ status:'PAID', reservationId, paymentId: paid.id }), { headers: corsHeaders });
    }

    // --- Default: unknown/pending ---
    return new Response(
      JSON.stringify({ status: "UNKNOWN", reservationId, paymentId: pending?.asaas_payment_id ?? pending?.pix_qr_code_id ?? null }),
      { status: 200, headers: corsHeaders },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
  }
});