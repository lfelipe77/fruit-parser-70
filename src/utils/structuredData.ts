import { GanhaveisData } from '@/data/ganhaveisData';

// Organization Schema
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Ganhavel",
  "url": "https://ganhavel.com",
  "logo": "https://ganhavel.com/logo.png",
  "description": "Plataforma de ganháveis justos e transparentes seguindo a loteria federal",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+5521985588220",
    "contactType": "customer service",
    "availableLanguage": "Portuguese"
  },
  "sameAs": [
    "https://wa.me/447747922946"
  ]
});

// Product Schema for Ganhaveis - Enhanced for social sharing
export const getProductSchema = (ganhavel: any) => {
  const price = ganhavel?.ticket_price ?? ganhavel?.ticketPrice ?? 0;
  const image = ganhavel?.image_url ?? ganhavel?.img;
  const absoluteImage = image?.startsWith('http') ? image : `https://ganhavel.com${image}`;
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": ganhavel.title || ganhavel.name,
    "description": ganhavel.description || `Participe do ${ganhavel.title} com transparência total`,
    "image": absoluteImage,
    "brand": {
      "@type": "Brand",
      "name": "Ganhavel"
    },
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "url": `https://ganhavel.com/#/ganhavel/${ganhavel.id}`,
      "seller": {
        "@type": "Organization",
        "name": "Ganhavel"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": ganhavel.participants_count || 10,
      "bestRating": "5",
      "worstRating": "1"
    },
    "category": ganhavel.category || ganhavel.category_name || "Ganhaveis"
  };
};

// Event Schema for Lottery Draws
export const getLotteryEventSchema = (ganhavel: GanhaveisData) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  "name": `Sorteio: ${ganhavel.title}`,
  "description": `Sorteio da rifa ${ganhavel.title} seguindo a ${ganhavel.lotteryType}`,
  "startDate": new Date(Date.now() + ganhavel.daysLeft * 24 * 60 * 60 * 1000).toISOString(),
  "location": {
    "@type": "VirtualLocation",
    "url": `https://ganhavel.com/ganhavel/${ganhavel.id}`
  },
  "organizer": {
    "@type": "Person",
    "name": ganhavel.organizer
  },
  "offers": {
    "@type": "Offer",
    "price": ganhavel.ticketPrice,
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  }
});

// Website Schema
export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Ganhavel",
  "url": "https://ganhavel.com",
  "description": "Plataforma de ganháveis justos e transparentes",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://ganhavel.com/descobrir?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Ganhavel",
    "logo": "https://ganhavel.com/logo.png"
  }
});

// FAQ Schema
export const getFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Como funcionam as rifas na Ganhavel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Todas as rifas seguem a loteria federal para garantir transparência e justiça nos sorteios."
      }
    },
    {
      "@type": "Question", 
      "name": "É seguro participar das rifas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sim, todas as rifas são verificadas e seguem rigorosos padrões de segurança e transparência."
      }
    },
    {
      "@type": "Question",
      "name": "Como recebo meu prêmio se ganhar?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "O organizador entrará em contato para coordenar a entrega do prêmio conforme descrito na rifa."
      }
    }
  ]
});

// Breadcrumb Schema
export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});