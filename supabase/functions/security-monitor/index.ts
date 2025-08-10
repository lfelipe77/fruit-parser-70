import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withCORS } from "../_shared/cors.ts"

Deno.serve(withCORS(async (req: Request) => {
  try {
    // Create supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Handle CORS preflight (may also be handled by withCORS)
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Content-Type': 'application/json' } });
    }

    // Authorization: require Bearer JWT and admin role
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.slice(7);
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, detectSessionInUrl: false }
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error('JWT validation failed:', userErr);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profileErr || !profile || profile.role !== 'admin') {
      console.warn('Forbidden: user is not admin', { userId, profileErr, role: profile?.role });
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body after auth
    const body = await req.json()
    const { action } = body

    console.log('Security monitor triggered with action:', action)

    if (action === 'run_checks') {
      try {
        const { error } = await supabase.rpc('run_security_checks');
        
        if (error) {
          console.error('Error running security checks:', error);
          return new Response(
            JSON.stringify({ ok: false, error: 'run_checks_failed' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }

        console.log('Security checks completed successfully');
        return new Response(
          JSON.stringify({ ok: true }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err) {
        console.error('Exception while running security checks:', err);
        return new Response(
          JSON.stringify({ ok: false, error: 'run_checks_failed' }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Manual alert creation
    if (action === 'create_alert') {
      const { error: alertErr } = await supabase.rpc('create_security_alert_admin_v2', {
        p_type: body.type,
        p_message: body.message ?? '',
        p_meta: body.meta ?? {}
      });

      if (alertErr) {
        console.error('create_alert failed:', alertErr);
        return new Response(
          JSON.stringify({ error: 'Failed to create security alert' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
      headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Security monitor error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}));