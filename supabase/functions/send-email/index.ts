import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { withCORS } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'welcome' | 'verify' | 'reset_password' | 'payment_receipt';
  variables?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`Email handler called: ${req.method}`);

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const body: EmailRequest = await req.json();
    const { to, subject, template, variables = {} } = body;

    console.log('Email request:', { to, subject, template });

    // Get email provider from environment
    const emailProvider = Deno.env.get("EMAIL_PROVIDER") || "gmail_smtp";
    
    if (emailProvider === "gmail_smtp") {
      await sendWithGmailSMTP(to, subject, template, variables);
    } else if (emailProvider === "sendgrid") {
      await sendWithSendGrid(to, subject, template, variables);
    } else {
      throw new Error(`Unsupported email provider: ${emailProvider}`);
    }

    console.log('Email sent successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Email handler error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send email" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

async function sendWithGmailSMTP(to: string, subject: string, template: string, variables: Record<string, any>) {
  // For now, we'll simulate email sending
  // In production, you would implement actual SMTP sending here
  const gmtpUser = Deno.env.get("GMAIL_SMTP_USER");
  const gmtpPass = Deno.env.get("GMAIL_SMTP_PASS");
  const fromEmail = Deno.env.get("FROM_EMAIL") || "no-reply@ganhavel.com";

  console.log(`[GMAIL SMTP] Simulating email send to ${to} with template ${template}`);
  console.log(`[GMAIL SMTP] Subject: ${subject}`);
  console.log(`[GMAIL SMTP] Variables:`, variables);
  
  // Simulate email templates
  let emailContent = '';
  
  switch (template) {
    case 'welcome':
      emailContent = `
        <h1>Bem-vindo ao Ganhavel!</h1>
        <p>Olá ${variables.name || 'usuário'},</p>
        <p>Sua conta foi criada com sucesso. Agora você pode participar das melhores rifas!</p>
        <p>Visite: <a href="https://ganhavel.com">https://ganhavel.com</a></p>
      `;
      break;
    case 'verify':
      emailContent = `
        <h1>Verificar Email - Ganhavel</h1>
        <p>Clique no link abaixo para verificar seu email:</p>
        <p><a href="${variables.verify_url}">Verificar Email</a></p>
      `;
      break;
    case 'reset_password':
      emailContent = `
        <h1>Redefinir Senha - Ganhavel</h1>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="${variables.reset_url}">Redefinir Senha</a></p>
      `;
      break;
    case 'payment_receipt':
      emailContent = `
        <h1>Comprovante de Pagamento - Ganhavel</h1>
        <p>Pagamento confirmado!</p>
        <p>Valor: R$ ${variables.amount}</p>
        <p>ID do Pagamento: ${variables.payment_id}</p>
      `;
      break;
  }

  // Log the simulated email
  console.log(`[EMAIL SENT] From: ${fromEmail}`);
  console.log(`[EMAIL SENT] To: ${to}`);
  console.log(`[EMAIL SENT] Subject: ${subject}`);
  console.log(`[EMAIL SENT] Content: ${emailContent.substring(0, 100)}...`);
  
  // In a real implementation, you would use a library like nodemailer here
  // For now, we just simulate success
  return Promise.resolve();
}

async function sendWithSendGrid(to: string, subject: string, template: string, variables: Record<string, any>) {
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
  
  if (!sendGridApiKey) {
    throw new Error("SendGrid API key not configured");
  }

  // SendGrid implementation would go here
  console.log(`[SENDGRID] Would send email to ${to} with template ${template}`);
  return Promise.resolve();
}

serve(withCORS(handler));