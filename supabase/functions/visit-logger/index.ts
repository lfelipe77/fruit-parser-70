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

    // Get real IP address from headers (considering proxies)
    const getRealIP = (request: Request): string => {
      // Try various headers that might contain the real IP
      const xForwardedFor = request.headers.get('x-forwarded-for')
      const xRealIP = request.headers.get('x-real-ip')
      const cfConnectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
      const xClientIP = request.headers.get('x-client-ip')
      
      // Return the first valid IP found
      if (cfConnectingIP) return cfConnectingIP
      if (xRealIP) return xRealIP
      if (xForwardedFor) return xForwardedFor.split(',')[0].trim()
      if (xClientIP) return xClientIP
      
      // Fallback to a default if no IP is found
      return 'unknown'
    }

    // Parse request body
    const body = await req.json()
    const { url, user_agent, referer } = body

    // Get visitor's IP
    const ip_address = getRealIP(req)
    
    console.log('Logging public visit:', { ip_address, url, user_agent })

    // Log the visit using the database function
    const { data, error } = await supabase.rpc('log_public_visit', {
      visit_ip: ip_address,
      visit_user_agent: user_agent || null,
      visit_url: url || '/',
      visit_referer: referer || null,
      visit_country: null, // Could be enhanced with IP geolocation
      visit_city: null
    })

    if (error) {
      console.error('Error logging public visit:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log visit' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return success (data will be null if visit was not logged due to rate limiting)
    return new Response(
      JSON.stringify({ 
        success: true, 
        visit_id: data,
        ip_address: ip_address,
        logged: data !== null 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Visit logger error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})