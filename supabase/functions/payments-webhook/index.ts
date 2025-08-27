// supabase/functions/payments-webhook/index.ts
// deno run -A supabase/functions/payments-webhook/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/v135/@supabase/supabase-js@2.53.0?target=deno";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

// --- helpers ---
async function readRaw(req: Request) {
  const ab = await req.arrayBuffer();
  return new Uint8Array(ab);
}
const td = new TextDecoder();

// TODO(Asaas): implement real HMAC verification using ASAAS_WEBHOOK_SECRET
function verifyAsaasSignature(_raw: Uint8Array, req: Request): boolean {
  const secret = Deno.env.get("ASAAS_WEBHOOK_SECRET");
  if (!secret) return false;
  // Example:
  // const sig = req.headers.get("X-Asaas-Signature") ?? "";
  // compute HMAC(raw) with secret and timing-safe compare with sig
  return true; // placeholder
}

// TODO(Stripe): verify "Stripe-Signature" header per Stripe docs using STRIPE_WEBHOOK_SECRET
function verifyStripeSignature(_raw: Uint8Array, req: Request): boolean {
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!secret) return false;
  // Typically: use stripe sdk or manual verification of signed payload
  return true; // placeholder
}

async function confirmAndLog(
  provider: "asaas" | "stripe",
  providerPaymentId: string,
  rawPayload: unknown
) {
  // 1) confirm payment via RPC (marks tx & tickets as paid)
  const { error: rpcError } = await supabase.rpc("confirm_payment", {
    p_provider: provider,
    p_provider_payment_id: providerPaymentId,
  });
  if (rpcError) throw rpcError;

  // 2) store raw payload for the matching transaction (service role bypasses RLS)
  const { error: updError } = await supabase
    .from("transactions")
    .update({ raw_payload: rawPayload })
    .eq("provider", provider)
    .eq("provider_payment_id", providerPaymentId);
  if (updError) console.warn("WARN: could not update raw_payload:", updError);
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const url = new URL(req.url);
    const path = url.pathname; // .../payments-webhook/asaas | .../stripe
    const raw = await readRaw(req);
    const text = td.decode(raw);

    // ASAAS
    if (path.endsWith("/asaas")) {
      if (!verifyAsaasSignature(raw, req)) {
        return new Response("Invalid Asaas signature", { status: 400 });
      }
      const payload = JSON.parse(text || "{}");

      // Extract a stable providerPaymentId and a "paid" state from Asaas payload
      const providerPaymentId =
        payload?.payment?.id ?? payload?.id ?? payload?.invoiceNumber ?? "";
      const status = String(
        payload?.event ?? payload?.payment?.status ?? payload?.status ?? ""
      ).toUpperCase();

      // Typical Asaas paid-like signals
      const paid = new Set([
        "PAYMENT_CONFIRMED",
        "CONFIRMED",
        "RECEIVED",
        "RECEIVED_IN_CASH",
        "PAID",
      ]);

      if (providerPaymentId && paid.has(status)) {
        await confirmAndLog("asaas", providerPaymentId, payload);
      }
      return new Response("OK", { status: 200 });
    }

    // STRIPE
    if (path.endsWith("/stripe")) {
      if (!verifyStripeSignature(raw, req)) {
        return new Response("Invalid Stripe signature", { status: 400 });
      }
      const event = JSON.parse(text || "{}");
      let providerPaymentId = "";

      switch (event?.type) {
        case "checkout.session.completed":
          providerPaymentId =
            event?.data?.object?.payment_intent ?? event?.data?.object?.id ?? "";
          break;
        case "payment_intent.succeeded":
          providerPaymentId = event?.data?.object?.id ?? "";
          break;
        default:
          // Ignore other event types
          return new Response("Ignored", { status: 200 });
      }

      if (providerPaymentId) {
        await confirmAndLog("stripe", providerPaymentId, event);
      }
      return new Response("OK", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return new Response("Internal Error", { status: 500 });
  }
});