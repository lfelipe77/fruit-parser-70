import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { withCORS } from "../_shared/cors.ts"

Deno.serve(withCORS(async (req: Request) => {
  // Always return success to client, log errors internally
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Accept any JSON payload
    let payload;
    try {
      payload = await req.json()
    } catch (parseError) {
      console.warn('Failed to parse JSON payload:', parseError)
      payload = {}
    }

    const { action, context, user_id } = payload

    // Sanitize and validate context to prevent JSON parsing errors
    let sanitizedContext = {}
    try {
      if (context && typeof context === 'object') {
        // Convert context to string and back to ensure it's valid JSON
        const contextStr = JSON.stringify(context)
        sanitizedContext = JSON.parse(contextStr)
      } else if (typeof context === 'string') {
        // If context is a string, try to parse it as JSON
        sanitizedContext = JSON.parse(context)
      }
    } catch (contextError) {
      console.warn('Failed to sanitize context, using empty object:', contextError)
      sanitizedContext = { raw_context: String(context).substring(0, 1000) } // Truncate if too long
    }

    console.log(`Logging audit event: ${action || 'unknown'}`, { user_id, context: sanitizedContext })

    // Try to log to audit_logs table, but don't fail if it doesn't work
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user_id || null,
          action: action || 'unknown_action',
          context: sanitizedContext
        })

      if (error) {
        console.error('Error logging audit event:', error)
      } else {
        console.log('Audit event logged successfully:', data)
      }
    } catch (dbError) {
      console.error('Database error in audit-logger:', dbError)
    }

  } catch (error) {
    console.error('Error in audit-logger:', error)
    // Don't propagate errors to client
  }

  // Always return 200 with success
  return new Response(
    JSON.stringify({ ok: true }),
    { 
      headers: { 'Content-Type': 'application/json' },
      status: 200 
    }
  )
}))