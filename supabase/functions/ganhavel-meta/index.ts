import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const ganhavelId = url.searchParams.get('id')
    
    if (!ganhavelId) {
      return new Response('Missing ganhavel ID', { status: 400, headers: corsHeaders })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch ganhavel data
    const { data: ganhavel, error } = await supabase
      .from('raffles_public_money_ext')
      .select('id,title,description,image_url,ticket_price,goal_amount')
      .eq('id', ganhavelId)
      .maybeSingle()

    if (error || !ganhavel) {
      console.error('Error fetching ganhavel:', error)
      return new Response('Ganhavel not found', { status: 404, headers: corsHeaders })
    }

    // Format data for meta tags
    const baseUrl = 'https://ganhavel.com'
    const imageUrl = ganhavel.image_url?.startsWith('http') 
      ? ganhavel.image_url 
      : `${baseUrl}${ganhavel.image_url || '/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png'}`
    
    const title = `${ganhavel.title} - Ganhavel`
    const description = `Compartilhe e participe deste ganhavel: ${ganhavel.title}! ${ganhavel.ticket_price ? `Bilhetes a partir de R$ ${(ganhavel.ticket_price / 100).toFixed(2)}.` : ''} ✅ Transparência total e sorte oficial.`
    const url = `${baseUrl}/#/ganhavel/${ganhavel.id}`
    const imageAlt = `${ganhavel.title} - Ganhe prêmios incríveis com transparência total`

    // Load HTML template
    const templateResponse = await fetch(`${baseUrl}/ganhavel/template.html`)
    let html = await templateResponse.text()

    // Replace placeholders
    html = html
      .replace(/\{\{TITLE\}\}/g, title)
      .replace(/\{\{DESCRIPTION\}\}/g, description)
      .replace(/\{\{IMAGE_URL\}\}/g, imageUrl)
      .replace(/\{\{IMAGE_ALT\}\}/g, imageAlt)
      .replace(/\{\{URL\}\}/g, url)
      .replace(/\{\{PRODUCT_NAME\}\}/g, ganhavel.title)
      .replace(/\{\{PRICE\}\}/g, ganhavel.ticket_price ? (ganhavel.ticket_price / 100).toString() : '0')
      .replace(/\{\{GANHAVEL_ID\}\}/g, ganhavel.id)

    return new Response(html, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Error in ganhavel-meta function:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})