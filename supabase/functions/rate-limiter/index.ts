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
  identifier: string // IP or user ID
  userAgent?: string
}

Deno.serve(withCORS(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, identifier, userAgent }: RateLimitCheck = await req.json()
    
    if (!action || !identifier) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
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

    const now = new Date()
    const windowStart = new Date(now.getTime() - rule.windowMs)

    // Check current attempts in the time window
    const { data: attempts, error: fetchError } = await supabase
      .from('rate_limit_attempts')
      .select('*')
      .eq('action', action)
      .eq('identifier', identifier)
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: false })

    if (fetchError) {
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

    // Log the attempt
    const { error: insertError } = await supabase
      .from('rate_limit_attempts')
      .insert({
        action,
        identifier,
        user_agent: userAgent || null,
        ip_address: getClientIP(req),
        created_at: now.toISOString()
      })

    if (insertError) {
      console.error('Error logging rate limit attempt:', insertError)
    }

    // Clean up old attempts (older than 24 hours)
    const cleanupTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    await supabase
      .from('rate_limit_attempts')
      .delete()
      .lt('created_at', cleanupTime.toISOString())

    const remaining = rule.limit - currentAttempts - 1
    const resetTime = new Date(now.getTime() + rule.windowMs)

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining,
        resetTime: resetTime.toISOString()
      }),
      { headers: { ...securityHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in rate-limiter function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
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

function getRateLimitMessage(action: keyof typeof RATE_LIMITS): string {
  switch (action) {
    case 'raffle_creation':
      return 'Você atingiu o limite de criação de rifas por hora. Tente novamente mais tarde.'
    case 'login_attempt':
      return 'Muitas tentativas de login inválidas. Sua conta foi temporariamente bloqueada por 15 minutos.'
    case 'signup_attempt':
      return 'Você atingiu o limite de cadastros por hora. Tente novamente mais tarde.'
    default:
      return 'Você atingiu o limite de ações por hora. Tente novamente mais tarde.'
  }
}