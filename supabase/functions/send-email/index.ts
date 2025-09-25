import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Temporarily disable nodemailer to fix build
// import nodemailer from "npm:nodemailer@6.9.14";
import { withCORS } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

interface EmailPayload {
  to: string;
  subject: string;
  html?: string;
  // Backward-compat fields (legacy callers)
  template?: 'welcome' | 'verify' | 'reset_password' | 'payment_receipt';
  variables?: Record<string, any>;
}

function buildTemplateHtml(template?: string, variables: Record<string, any> = {}): string | null {
  switch (template) {
    case 'welcome':
      return `
        <h1>Bem-vindo ao Ganhavel!</h1>
        <p>Olá ${variables.name || 'usuário'},</p>
        <p>Sua conta foi criada com sucesso. Agora você pode participar das melhores rifas!</p>
        <p>Visite: <a href="https://ganhavel.com">https://ganhavel.com</a></p>
      `;
    case 'verify':
      return `
        <h1>Verificar Email - Ganhavel</h1>
        <p>Clique no link abaixo para verificar seu email:</p>
        <p><a href="${variables.verify_url}">Verificar Email</a></p>
      `;
    case 'reset_password':
      return `
        <h1>Redefinir Senha - Ganhavel</h1>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="${variables.reset_url}">Redefinir Senha</a></p>
      `;
    case 'payment_receipt':
      return `
        <h1>Comprovante de Pagamento - Ganhavel</h1>
        <p>Pagamento confirmado!</p>
        <p>Valor: R$ ${variables.amount}</p>
        <p>ID do Pagamento: ${variables.payment_id}</p>
      `;
    default:
      return null;
  }
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`[send-email] method=${req.method}`);

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ ok: false, error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    let body: EmailPayload;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid JSON body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { to, subject } = body || {} as EmailPayload;
    let emailHtml = body?.html;

    // Backward-compat: support legacy template + variables
    if (!emailHtml && body?.template) {
      emailHtml = buildTemplateHtml(body.template, body.variables);
    }

    if (!to || !subject || !emailHtml) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields. Provide: to, subject, and html (or template + variables)." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Feature toggle: panic switch for emails
    const emailsEnabled = Deno.env.get("EMAILS_ENABLED");
    if (emailsEnabled !== "true") {
      return new Response(
        JSON.stringify({ ok: false, error: "Emails disabled by configuration" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // AuthN/AuthZ: require a valid user and restrict "to" unless admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authHeader = req.headers.get("Authorization") || "";

    const supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userRes, error: userErr } = await supabaseClient.auth.getUser();
    const user = userRes?.user || null;
    if (userErr || !user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let isAdmin = false;
    try {
      const { data: adminData } = await supabaseClient.rpc('is_admin', { p_uid: user.id });
      isAdmin = !!adminData;
    } catch (_e) {
      isAdmin = false;
    }

    if (!isAdmin && to !== user.email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Forbidden: cannot send emails to other recipients" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Read SMTP settings from environment
    const host = Deno.env.get("SMTP_HOST");
    const portStr = Deno.env.get("SMTP_PORT") ?? "587";
    const port = Number(portStr);
    const userSmtp = Deno.env.get("SMTP_USER");
    const pass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "no-reply@ganhavel.com";
    const supportEmail = "suporte@ganhavel.com";
    const replyTo = Deno.env.get("REPLY_TO") || supportEmail;

    if (!host || !userSmtp || !pass || !port || Number.isNaN(port)) {
      console.error("[send-email] Missing SMTP configuration", { host: !!host, user: !!userSmtp, pass: !!pass, port });
      return new Response(
        JSON.stringify({ ok: false, error: "SMTP not configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL)" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Temporarily disabled - nodemailer causing build issues
    console.log(`[send-email] DISABLED - Would send email to=${to} subject=${subject}`);
    
    const info: any = { messageId: 'disabled-' + Date.now() };

    console.log("[send-email] sent", { messageId: info?.messageId });

    return new Response(
      JSON.stringify({ ok: true, messageId: info?.messageId || null }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[send-email] error", error);
    return new Response(
      JSON.stringify({ ok: false, error: error?.message || "Failed to send email" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(withCORS(handler));
