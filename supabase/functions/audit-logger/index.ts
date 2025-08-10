import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'
import { withCORS } from "../_shared/cors.ts"

Deno.serve(withCORS(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { action, context, user_id } = await req.json()

    if (!action) {
      throw new Error('Action is required')
    }

    console.log(`Logging audit event: ${action}`, { user_id, context })

    // Log to audit_logs table
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user_id || null,
        action,
        context: context || {}
      })

    if (error) {
      console.error('Error logging audit event:', error)
      throw error
    }

    console.log('Audit event logged successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in audit-logger:', error)
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        success: false 
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
}))