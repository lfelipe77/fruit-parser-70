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
      // Run all security checks
      const { error } = await supabase.rpc('run_security_checks')
      
      if (error) {
        console.error('Error running security checks:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to run security checks' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('Security checks completed successfully')
      
      return new Response(
        JSON.stringify({ success: true, message: 'Security checks completed' }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Manual alert creation
    if (action === 'create_alert') {
      const { 
        type, 
        description, 
        ip_address, 
        user_id, 
        context = {}, 
        severity = 'medium' 
      } = body

      const { data, error } = await supabase.rpc('create_security_alert_admin', {
        p_type: type,
        p_description: description,
        p_severity: severity,
        p_context: context,
        p_ip_address: ip_address,
        p_user_id: user_id
      })

      if (error) {
        console.error('Error creating security alert:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create security alert' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('Security alert created with ID:', data)

      return new Response(
        JSON.stringify({ success: true, alert_id: data }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' }
        }
      )
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