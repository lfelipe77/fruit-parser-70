import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  noindex?: boolean;
  structuredData?: object;
  price?: number;
  author?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Ganhavel – Ganhe prêmios reais com transparência e sorte oficial",
  description = "Participe ou lance seu Ganhavel com prêmios de verdade, links afiliados e sorteios rastreados pela Loteria Federal.",
  canonical,
  ogImage = "https://ganhavel.com/lovable-uploads/c9c19afd-3358-47d6-a351-f7f1fe50603c.png",
  ogImageAlt = "Ganhe prêmios incríveis com a Ganhavel — Prêmios justos e transparentes",
  ogType = "website",
  noindex = false,
  structuredData,
  price,
  author
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ganhavel.com';
  const canonicalUrl = canonical || currentUrl;

  // Ensure absolute URLs for Open Graph images
  const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `https://ganhavel.com${ogImage}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Mobile & App Meta */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="apple-touch-icon" href="/lovable-uploads/4f6691ae-418c-477c-9958-16166ad9f887.png" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}
      
      {/* Open Graph Enhanced */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Ganhavel" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Enhanced Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ganhavel" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      
      {/* Product/Article specific meta tags */}
      {price && (
        <>
          <meta property="product:price:amount" content={price.toString()} />
          <meta property="product:price:currency" content="BRL" />
        </>
      )}
      {author && <meta name="author" content={author} />}
      {ogType === 'article' && (
        <>
          <meta property="article:published_time" content={new Date().toISOString()} />
          <meta property="article:section" content="Ganhaveis" />
        </>
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;