import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";

interface DebugSecretsResponse {
  hasApiKey: boolean;
  hasWebhookSecret: boolean;
}

/**
 * Debug Secrets Endpoint
 * 
 * Returns boolean flags indicating whether required secrets are configured.
 * Does NOT expose actual secret values for security.
 */
async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const response: DebugSecretsResponse = {
      hasApiKey: !!Deno.env.get('ASAAS_API_KEY'),
      hasWebhookSecret: !!Deno.env.get('ASAAS_WEBHOOK_SECRET')
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('[DebugSecrets] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

serve(withCORS(handler));