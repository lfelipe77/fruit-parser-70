import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple mail via console log for MVP - replace with your email provider later
async function sendEmail(to: string[], subject: string, html: string) {
  console.log("DIGEST EMAIL TO:", to.join(", "), subject);
  console.log(html);
  // TODO: Replace with actual email service (Resend, SendGrid, etc.)
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // last 24h paid transactions
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();

    const { data: txs, error } = await supabase
      .from("transactions")
      .select("id, created_at, ganhavel_id, amount, type, payment_provider, total_amount_computed, user_id, status")
      .eq("status", "paid")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // aggregate revenue (ticket revenue only)
    const gross = (txs || []).reduce((s, t) => s + Number(t.amount || 0), 0);
    const count = txs?.length || 0;

    // top ganhaveis by revenue (last 24h)
    const byGanhavel: Record<string, number> = {};
    for (const t of txs || []) {
      byGanhavel[t.ganhavel_id] = (byGanhavel[t.ganhavel_id] || 0) + Number(t.amount || 0);
    }
    const top = Object.entries(byGanhavel).sort((a,b)=>b[1]-a[1]).slice(0,5);

    const html = `
      <h2>Ganhavel — Digest (24h)</h2>
      <p><b>Pagamentos confirmados:</b> ${count}</p>
      <p><b>Receita (bruta tickets):</b> R$ ${(gross).toFixed(2)}</p>
      <h3>Top Ganhaveis</h3>
      <ul>
        ${top.map(([gid,val]) => `<li>${gid.slice(0,8)}… — R$ ${val.toFixed(2)}</li>`).join("")}
      </ul>
      <p>Baixe CSV:</p>
      <ul>
        <li>TX (paid): /functions/v1/export-csv/transactions?status=paid</li>
        <li>Payouts: /functions/v1/export-csv/payouts</li>
      </ul>
    `;

    // admin emails from user_profiles with role = 'admin'
    const { data: admins } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("role", "admin");
    
    // Get auth users for admin emails
    const adminIds = (admins || []).map(a => a.id);
    if (adminIds.length > 0) {
      // Note: auth.users is not directly accessible via client, using RPC or edge function privileges
      console.log("Would send digest to admin IDs:", adminIds);
      await sendEmail(["admin@example.com"], "Ganhavel — Digest (24h)", html);
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (e) {
    console.error(e);
    return new Response("Internal Error", { status: 500, headers: corsHeaders });
  }
});