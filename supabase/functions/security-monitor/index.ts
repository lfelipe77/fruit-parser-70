import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create supabase client with service role for database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })

    // Parse request body
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
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Security checks completed successfully')
      
      return new Response(
        JSON.stringify({ success: true, message: 'Security checks completed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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

      const { data, error } = await supabase.rpc('create_security_alert', {
        alert_type: type,
        alert_description: description,
        alert_ip_address: ip_address,
        alert_user_id: user_id,
        alert_context: context,
        alert_severity: severity
      })

      if (error) {
        console.error('Error creating security alert:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create security alert' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Security alert created with ID:', data)

      return new Response(
        JSON.stringify({ success: true, alert_id: data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Security monitor error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})