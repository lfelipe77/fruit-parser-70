import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditLogRequest {
  action: string;
  context: Record<string, any>;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { action, context, user_id }: AuditLogRequest = await req.json();

    // Validate required fields
    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    // Enrich context with server-side data
    const enrichedContext = {
      ...context,
      ip_address: clientIP,
      server_timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent') || 'unknown'
    };

    // Insert audit log
    const { error: logError } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user_id || null,
        action,
        context: enrichedContext
      });

    if (logError) {
      console.error('Failed to insert audit log:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to log audit event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for sensitive actions that require security alerts
    const sensitiveActions = [
      'user_banned', 'role_promoted', 'role_demoted', 'bulk_action_performed',
      'admin_settings_changed', 'data_export_requested'
    ];

    if (sensitiveActions.includes(action) && user_id) {
      // Create security alert for sensitive admin actions
      await supabaseClient.rpc('create_security_alert', {
        alert_type: 'admin_action',
        alert_description: `Sensitive admin action performed: ${action}`,
        alert_user_id: user_id,
        alert_context: {
          action,
          context: enrichedContext,
          ip_address: clientIP
        },
        alert_severity: 'medium'
      });
    }

    // Rate limiting check for authentication events
    if (['user_login_failed', 'user_signup'].includes(action)) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      // Count recent failed attempts from this IP
      const { count } = await supabaseClient
        .from('audit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('action', action)
        .gte('created_at', oneHourAgo)
        .eq('context->>ip_address', clientIP);

      // Create security alert if too many attempts
      if (count && count > 10) {
        await supabaseClient.rpc('create_security_alert', {
          alert_type: action === 'user_login_failed' ? 'login_abuse' : 'signup_abuse',
          alert_description: `Excessive ${action} attempts from IP ${clientIP}`,
          alert_ip_address: clientIP,
          alert_context: {
            attempt_count: count,
            timeframe: '1 hour',
            action
          },
          alert_severity: 'high'
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Audit event logged successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Audit logger error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});