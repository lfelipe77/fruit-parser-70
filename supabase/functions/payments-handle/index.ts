import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { withCORS } from "../_shared/cors.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePaymentRequest {
  amount: number;
  currency: string;
  user_id: string;
  raffle_id: string;
  ticket_count?: number;
}

interface WebhookPayload {
  payment_id: string;
  status: 'completed' | 'failed' | 'pending';
  amount: number;
  currency: string;
  user_id: string;
  raffle_id: string;
  ticket_count: number;
}

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log(`Payment handler called: ${req.method} ${pathname}`);

  // Initialize Supabase clients
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    if (pathname.endsWith('/create') && req.method === 'POST') {
      // Handle payment creation
      console.log('Processing payment creation...');

      // Get authenticated user
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("Authorization header missing");
      }

      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      const user = userData.user;

      if (!user) {
        throw new Error("User not authenticated");
      }

      const body: CreatePaymentRequest = await req.json();
      const { amount, currency, raffle_id, ticket_count = 1 } = body;

      console.log('Payment request:', { amount, currency, raffle_id, ticket_count, user_id: user.id });

      // Validate required fields
      if (!amount || !currency || !raffle_id) {
        throw new Error("Missing required fields: amount, currency, raffle_id");
      }

      // For now, create a stub payment session
      const payment_id = crypto.randomUUID();
      const checkout_url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/payments-handle/checkout/${payment_id}?return_url=${encodeURIComponent(req.headers.get("origin") + "/#/payment-success")}`;

      // Create transaction record
      const { error: transactionError } = await supabaseService
        .from('transactions')
        .insert({
          id: payment_id,
          user_id: user.id,
          ganhavel_id: raffle_id,
          amount: amount,
          type: 'payment',
          status: 'pending',
          payment_provider: 'stub',
          source: 'web'
        });

      if (transactionError) {
        console.error('Transaction creation error:', transactionError);
        throw new Error('Failed to create transaction');
      }

      console.log('Payment session created successfully:', payment_id);

      return new Response(JSON.stringify({
        success: true,
        payment_id,
        checkout_url
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else if (pathname.includes('/checkout/') && req.method === 'GET') {
      // Handle checkout page (stub)
      const paymentId = pathname.split('/checkout/')[1];
      const returnUrl = url.searchParams.get('return_url') || 'https://ganhavel.com/#/';

      console.log('Serving checkout page for payment:', paymentId);

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Checkout - Ganhavel</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
            .btn { background: #22c55e; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; }
            .btn:hover { background: #16a34a; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Checkout - Pagamento Simulado</h1>
            <div class="warning">
              <strong>⚠️ Ambiente de Desenvolvimento</strong><br>
              Este é um pagamento simulado para testes. Nenhuma cobrança real será efetuada.
            </div>
            <p><strong>ID do Pagamento:</strong> ${paymentId}</p>
            <p>Clique no botão abaixo para simular um pagamento bem-sucedido:</p>
            <button class="btn" onclick="processPayment()">Confirmar Pagamento (Simulado)</button>
            <script>
              async function processPayment() {
                try {
                  const response = await fetch('/functions/v1/payments-handle/webhook', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': 'Bearer ${Deno.env.get("PAYMENT_WEBHOOK_SECRET") || "dev-secret"}'
                    },
                    body: JSON.stringify({
                      payment_id: '${paymentId}',
                      status: 'completed',
                      amount: 1000,
                      currency: 'BRL'
                    })
                  });
                  
                  if (response.ok) {
                    window.location.href = '${returnUrl}';
                  } else {
                    alert('Erro ao processar pagamento. Tente novamente.');
                  }
                } catch (error) {
                  alert('Erro de conexão. Tente novamente.');
                }
              }
            </script>
          </div>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: { ...corsHeaders, "Content-Type": "text/html" },
        status: 200,
      });

    } else if (pathname.endsWith('/webhook') && req.method === 'POST') {
      // Handle payment webhook
      console.log('Processing payment webhook...');

      // Verify webhook secret
      const authHeader = req.headers.get("Authorization");
      const expectedSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET") || "dev-secret";
      
      if (!authHeader || !authHeader.includes(expectedSecret)) {
        console.error('Invalid webhook authorization');
        throw new Error("Invalid webhook authorization");
      }

      const body: WebhookPayload = await req.json();
      const { payment_id, status, amount, currency } = body;

      console.log('Webhook payload:', { payment_id, status, amount, currency });

      // Update transaction status
      const { error: updateError } = await supabaseService
        .from('transactions')
        .update({
          status: status,
          received_at: new Date().toISOString()
        })
        .eq('id', payment_id);

      if (updateError) {
        console.error('Transaction update error:', updateError);
        throw new Error('Failed to update transaction');
      }

      // If payment completed, create tickets
      if (status === 'completed') {
        const { data: transaction, error: fetchError } = await supabaseService
          .from('transactions')
          .select('user_id, ganhavel_id, amount')
          .eq('id', payment_id)
          .single();

        if (fetchError || !transaction) {
          console.error('Failed to fetch transaction:', fetchError);
          throw new Error('Transaction not found');
        }

        // Create tickets (simplified logic)
        const ticketCount = Math.max(1, Math.floor(amount / 100)); // 1 ticket per R$1.00
        
        for (let i = 0; i < ticketCount; i++) {
          const { error: ticketError } = await supabaseService
            .from('tickets')
            .insert({
              user_id: transaction.user_id,
              ganhavel_id: transaction.ganhavel_id,
              payment_status: 'paid',
              is_paid: true,
              total_amount: amount / ticketCount,
              ticket_number: Math.floor(Math.random() * 1000000) + 1
            });

          if (ticketError) {
            console.error('Ticket creation error:', ticketError);
          }
        }

        console.log(`Created ${ticketCount} tickets for payment ${payment_id}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook processed successfully'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });

    } else {
      throw new Error(`Method ${req.method} not allowed for ${pathname}`);
    }

  } catch (error: any) {
    console.error("Payment handler error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(withCORS(handler));