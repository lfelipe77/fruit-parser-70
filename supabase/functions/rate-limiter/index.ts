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
  'login_attempt': { limit: 5, windowMs: 15 * 60 * 1000 },   // 5 per 15 minutes
  'signup_attempt': { limit: 3, windowMs: 60 * 60 * 1000 },  // 3 per hour
} as const

type RateLimitAction = keyof typeof RATE_LIMITS

interface RateLimitCheckBody {
  action: RateLimitAction
  email?: string
  userAgent?: string
}

Deno.serve(withCORS(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = (await req.json().catch(() => ({}))) as Partial<RateLimitCheckBody>
    const action = body.action as RateLimitAction
    const email = (body.email || '').toLowerCase().trim()
    const userAgent = body.userAgent || null

    if (!action || !(action in RATE_LIMITS)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid or missing action' }),
        { status: 400, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ip = getClientIP(req)
    const now = new Date()
    const windowMs = RATE_LIMITS[action].windowMs
    const windowStart = new Date(now.getTime() - windowMs)

    // Build identifiers (server-side only)
    const idIp = await sha256(`${ip}|${action}`)
    const identifiersToInsert: string[] = [idIp]

    if (email && (action === 'login_attempt' || action === 'signup_attempt')) {
      const idIpEmail = await sha256(`${ip}|${email}|${action}`)
      identifiersToInsert.push(idIpEmail)
    }

    // Enforce per-IP ceilings
    const { data: attemptsIp, error: fetchError } = await supabase
      .from('rate_limit_attempts')
      .select('created_at')
      .eq('action', action)
      .eq('identifier', idIp)
      .gte('created_at', windowStart.toISOString())

    if (fetchError) {
      console.error('Error fetching rate limit attempts:', fetchError)
      return new Response(
        JSON.stringify({ ok: false, error: 'Database error' }),
        { status: 500, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentAttempts = attemptsIp?.length || 0
    if (currentAttempts >= RATE_LIMITS[action].limit) {
      const lastAttempt = attemptsIp?.[0]
      const resetTime = new Date(new Date(lastAttempt.created_at as string).getTime() + windowMs)
      return new Response(
        JSON.stringify({ ok: false, reason: 'rate_limited', resetTime: resetTime.toISOString() }),
        { status: 429, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the attempt (both identifiers if applicable)
    for (const ident of identifiersToInsert) {
      const { error: insertError } = await supabase
        .from('rate_limit_attempts')
        .insert({
          action,
          identifier: ident,
          user_agent: userAgent,
          ip_address: ip,
          created_at: now.toISOString(),
        })
      if (insertError) console.error('Error logging rate limit attempt:', insertError)
    }

    // Clean up old attempts (older than 24 hours)
    const cleanupTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    await supabase.from('rate_limit_attempts').delete().lt('created_at', cleanupTime.toISOString())

    const remaining = RATE_LIMITS[action].limit - currentAttempts - 1
    const resetTime = new Date(now.getTime() + windowMs)

    return new Response(
      JSON.stringify({ ok: true, remaining, resetTime: resetTime.toISOString() }),
      { headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in rate-limiter function:', error)
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
    )
  }
}))

function getClientIP(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

async function sha256(input: string): Promise<string> {
  const buffer = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = Array.from(new Uint8Array(hash))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}
