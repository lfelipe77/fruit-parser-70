import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { withCORS } from "../_shared/cors.ts"

const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'Frame-Options': 'DENY',
  'Frame-ancestors': "'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co https://whqxpuyjxoiufzhvqneg.functions.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; object-src 'none';",
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
}

Deno.serve(withCORS(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { url, user_agent, referer } = await req.json()
    
    // Get IP address from request
    const ip_address = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown'

    console.log('Logging visit:', { url, ip_address, user_agent })

    // Call the log_public_visit function
    const { data, error } = await supabase.rpc('log_public_visit', {
      visit_ip: ip_address,
      visit_user_agent: user_agent || null,
      visit_url: url || '/',
      visit_referer: referer || null,
      visit_country: null, // Could be enhanced with IP geolocation
      visit_city: null
    })

    if (error) {
      console.error('Error logging visit:', error)
      throw error
    }

    console.log('Visit logged successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        visit_id: data 
      }),
      { 
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in visit-logger:', error)
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        success: false 
      }),
      { 
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}))