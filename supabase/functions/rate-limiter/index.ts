import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { withCORS } from "../_shared/cors.ts"


const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src * data: blob:; connect-src *; frame-ancestors 'none';",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// Rate limiting rules
const RATE_LIMITS = {
  'raffle_creation': { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  'login_attempt': { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 minutes
  'signup_attempt': { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
}

interface RateLimitCheck {
  action: keyof typeof RATE_LIMITS
  email?: string // optional for login/signup to improve correlation
  userAgent?: string
}

Deno.serve(withCORS(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, userAgent }: RateLimitCheck = await req.json()

    if (!action) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required parameters' }),
        { status: 400, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const rule = RATE_LIMITS[action]
    if (!rule) {
      return new Response(
        JSON.stringify({ error: 'Invalid action type' }),
        { status: 400, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ip = getClientIP(req)
    const idIp = await sha256(`${ip}|${action}`)
    const idsToInsert: string[] = [idIp]

    // For login/signup, also log per IP+email key if provided
    const normalizedEmail = (email || '').toLowerCase().trim()
    if (normalizedEmail && (action === 'login_attempt' || action === 'signup_attempt')) {
      const idIpEmail = await sha256(`${ip}|${normalizedEmail}|${action}`)
      idsToInsert.push(idIpEmail)
    }

    const rule = RATE_LIMITS[action]
    if (!rule) {
      console.error('Error fetching rate limit attempts:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentAttempts = attempts?.length || 0
    
    // Check if rate limit exceeded
    if (currentAttempts >= rule.limit) {
      const lastAttempt = attempts?.[0]
      const resetTime = new Date(new Date(lastAttempt.created_at).getTime() + rule.windowMs)
      
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          resetTime: resetTime.toISOString(),
          message: getRateLimitMessage(action)
        }),
        { status: 429, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the attempt for each identifier we generated
    for (const ident of idsToInsert) {
      const { error: insertError } = await supabase
        .from('rate_limit_attempts')
        .insert({
          action,
          identifier: ident,
          user_agent: userAgent || null,
          ip_address: ip,
          created_at: now.toISOString()
        })
      if (insertError) {
        console.error('Error logging rate limit attempt:', insertError)
      }
    }

    // Clean up old attempts (older than 24 hours)
    const cleanupTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    await supabase
      .from('rate_limit_attempts')
      .delete()
      .lt('created_at', cleanupTime.toISOString())

    const remaining = RATE_LIMITS[action].limit - currentAttempts - 1
    const resetTime = new Date(now.getTime() + RATE_LIMITS[action].windowMs)

    return new Response(
      JSON.stringify({
        ok: true,
        remaining,
        resetTime: resetTime.toISOString()
      }),
      { headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in rate-limiter function:', error)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
    )
  }
}));

function getClientIP(req: Request): string {
  return req.headers.get('cf-connecting-ip') || 
         req.headers.get('x-forwarded-for')?.split(',')[0] || 
         req.headers.get('x-real-ip') || 
         'unknown'
}

async function sha256(input: string): Promise<string> {
  const buffer = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = Array.from(new Uint8Array(hash))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}