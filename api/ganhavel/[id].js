import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'Missing ganhavel ID' })
  }

  try {
    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch ganhavel data
    const { data: ganhavel, error } = await supabase
      .from('raffles_public_money_ext')
      .select('id,title,description,image_url,ticket_price,goal_amount')
      .eq('id', id)
      .maybeSingle()

    if (error || !ganhavel) {
      console.error('Error fetching ganhavel:', error)
      return res.status(404).json({ error: 'Ganhavel not found' })
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

    // Generate HTML with proper meta tags for social sharing
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:alt" content="${imageAlt}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="Ganhavel">
  <meta property="og:locale" content="pt_BR">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@ganhavel">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:image:alt" content="${imageAlt}">
  
  <!-- Product Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "${ganhavel.title}",
    "description": "${description}",
    "image": "${imageUrl}",
    "brand": {
      "@type": "Brand",
      "name": "Ganhavel"
    },
    "offers": {
      "@type": "Offer",
      "price": "${ganhavel.ticket_price ? (ganhavel.ticket_price / 100) : 0}",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "url": "${url}"
    }
  }
  </script>
  
  <!-- Instant redirect to hash-based route -->
  <script>
    window.location.replace('/#/ganhavel/${ganhavel.id}');
  </script>
  
  <!-- Fallback for non-JS -->
  <noscript>
    <meta http-equiv="refresh" content="0; url=/#/ganhavel/${ganhavel.id}">
  </noscript>
</head>
<body>
  <!-- Fallback content for crawlers -->
  <h1>${title}</h1>
  <p>${description}</p>
  <img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;">
  <p><a href="/#/ganhavel/${ganhavel.id}">Acessar Ganhavel</a></p>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    res.status(200).send(html)

  } catch (error) {
    console.error('Error in ganhavel meta API:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}