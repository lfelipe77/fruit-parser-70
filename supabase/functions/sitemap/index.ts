import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml; charset=utf-8',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active raffles with slugs
    const { data: raffles, error } = await supabase
      .from('raffles')
      .select('id, slug, updated_at, status')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const baseUrl = 'https://weautomatetheworld.com';
    const today = new Date().toISOString().split('T')[0];

    // Static pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/descobrir', priority: '0.9', changefreq: 'daily' },
      { loc: '/categorias', priority: '0.8', changefreq: 'weekly' },
      { loc: '/resultados', priority: '0.8', changefreq: 'daily' },
      { loc: '/como-funciona', priority: '0.7', changefreq: 'monthly' },
      { loc: '/lance-seu-ganhavel', priority: '0.8', changefreq: 'monthly' },
      { loc: '/central-de-ajuda', priority: '0.6', changefreq: 'monthly' },
      { loc: '/sobre-nos', priority: '0.5', changefreq: 'monthly' },
      { loc: '/confianca-seguranca', priority: '0.6', changefreq: 'monthly' },
      { loc: '/guia-do-criador', priority: '0.6', changefreq: 'monthly' },
      // Category pages
      { loc: '/categorias/carros-motos', priority: '0.7', changefreq: 'weekly' },
      { loc: '/categorias/celulares-smartwatches', priority: '0.7', changefreq: 'weekly' },
      { loc: '/categorias/games-consoles', priority: '0.7', changefreq: 'weekly' },
      { loc: '/categorias/diversos-propriedades', priority: '0.7', changefreq: 'weekly' },
      { loc: '/categorias/gift-cards', priority: '0.7', changefreq: 'weekly' },
    ];

    // Build XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add dynamic raffle pages
    for (const raffle of raffles || []) {
      const key = raffle.slug || raffle.id;
      const lastmod = raffle.updated_at 
        ? new Date(raffle.updated_at).toISOString().split('T')[0] 
        : today;

      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/ganhavel/${encodeURIComponent(key)}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    return new Response(xml, { 
      headers: corsHeaders,
      status: 200 
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
