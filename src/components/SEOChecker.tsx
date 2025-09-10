import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, Search, Share2, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SEOCheck {
  id: string;
  category: 'Critical' | 'Important' | 'Good';
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
}

const SEOChecker: React.FC = () => {
  const [checks, setChecks] = useState<SEOCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    performSEOChecks();
  }, []);

  const performSEOChecks = () => {
    setLoading(true);
    
    const seoChecks: SEOCheck[] = [
      // Critical SEO Elements
      {
        id: 'title',
        category: 'Critical',
        title: 'Page Title',
        description: 'Title tag exists and is optimized',
        status: document.title ? 'pass' : 'fail',
        details: document.title || 'No title found'
      },
      {
        id: 'meta-description',
        category: 'Critical',
        title: 'Meta Description',
        description: 'Meta description exists and is under 160 chars',
        status: (() => {
          const meta = document.querySelector('meta[name="description"]');
          const content = meta?.getAttribute('content') || '';
          if (!content) return 'fail';
          if (content.length > 160) return 'warning';
          return 'pass';
        })(),
        details: (() => {
          const meta = document.querySelector('meta[name="description"]');
          const content = meta?.getAttribute('content') || '';
          return content ? `${content.length}/160 characters` : 'No meta description found';
        })()
      },
      {
        id: 'h1',
        category: 'Critical',
        title: 'H1 Tag',
        description: 'Single H1 tag exists on page',
        status: (() => {
          const h1s = document.querySelectorAll('h1');
          if (h1s.length === 0) return 'fail';
          if (h1s.length > 1) return 'warning';
          return 'pass';
        })(),
        details: (() => {
          const h1s = document.querySelectorAll('h1');
          return `Found ${h1s.length} H1 tag(s)`;
        })()
      },
      
      // Social Media & Sharing
      {
        id: 'og-image',
        category: 'Important',
        title: 'Open Graph Image',
        description: 'OG image with proper dimensions',
        status: (() => {
          const ogImage = document.querySelector('meta[property="og:image"]');
          const ogImageWidth = document.querySelector('meta[property="og:image:width"]');
          const ogImageHeight = document.querySelector('meta[property="og:image:height"]');
          
          if (!ogImage) return 'fail';
          if (!ogImageWidth || !ogImageHeight) return 'warning';
          return 'pass';
        })(),
        details: (() => {
          const ogImage = document.querySelector('meta[property="og:image"]');
          const width = document.querySelector('meta[property="og:image:width"]')?.getAttribute('content');
          const height = document.querySelector('meta[property="og:image:height"]')?.getAttribute('content');
          
          if (!ogImage) return 'No OG image found';
          return `Image: ${width}x${height}px`;
        })()
      },
      {
        id: 'twitter-card',
        category: 'Important',
        title: 'Twitter Card',
        description: 'Twitter card meta tags configured',
        status: (() => {
          const twitterCard = document.querySelector('meta[name="twitter:card"]');
          const twitterImage = document.querySelector('meta[name="twitter:image"]');
          
          if (!twitterCard) return 'fail';
          if (!twitterImage) return 'warning';
          return 'pass';
        })(),
        details: (() => {
          const twitterCard = document.querySelector('meta[name="twitter:card"]');
          return twitterCard ? `Card type: ${twitterCard.getAttribute('content')}` : 'No Twitter card found';
        })()
      },
      
      // Technical SEO
      {
        id: 'canonical',
        category: 'Important',
        title: 'Canonical URL',
        description: 'Canonical URL is properly set',
        status: (() => {
          const canonical = document.querySelector('link[rel="canonical"]');
          return canonical ? 'pass' : 'warning';
        })(),
        details: (() => {
          const canonical = document.querySelector('link[rel="canonical"]');
          return canonical ? canonical.getAttribute('href') || '' : 'No canonical URL found';
        })()
      },
      {
        id: 'structured-data',
        category: 'Good',
        title: 'Structured Data',
        description: 'JSON-LD structured data present',
        status: (() => {
          const jsonLd = document.querySelector('script[type="application/ld+json"]');
          return jsonLd ? 'pass' : 'warning';
        })(),
        details: (() => {
          const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
          return `Found ${jsonLd.length} structured data block(s)`;
        })()
      },
      {
        id: 'images-alt',
        category: 'Good',
        title: 'Image Alt Text',
        description: 'Images have descriptive alt attributes',
        status: (() => {
          const images = document.querySelectorAll('img');
          const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
          
          if (images.length === 0) return 'pass';
          if (imagesWithoutAlt.length === 0) return 'pass';
          if (imagesWithoutAlt.length < images.length / 2) return 'warning';
          return 'fail';
        })(),
        details: (() => {
          const images = document.querySelectorAll('img');
          const imagesWithoutAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
          return `${images.length - imagesWithoutAlt.length}/${images.length} images have alt text`;
        })()
      },
      {
        id: 'mobile-viewport',
        category: 'Critical',
        title: 'Mobile Viewport',
        description: 'Mobile viewport meta tag configured',
        status: (() => {
          const viewport = document.querySelector('meta[name="viewport"]');
          return viewport ? 'pass' : 'fail';
        })(),
        details: (() => {
          const viewport = document.querySelector('meta[name="viewport"]');
          return viewport ? viewport.getAttribute('content') || '' : 'No viewport meta tag found';
        })()
      }
    ];

    setChecks(seoChecks);
    setLoading(false);
  };

  const testSocialSharing = async () => {
    const currentUrl = window.location.href;
    
    // Test various social media URLs
    const socialTests = [
      { platform: 'Facebook', url: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(currentUrl)}` },
      { platform: 'Twitter', url: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(currentUrl)}` },
      { platform: 'LinkedIn', url: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(currentUrl)}` }
    ];

    toast({
      title: "Social Media Testing Links",
      description: "Check console for testing URLs"
    });

    console.log('🔍 Social Media Testing URLs:', socialTests);
    socialTests.forEach(test => {
      console.log(`${test.platform}: ${test.url}`);
    });
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <Badge variant="outline" className="text-green-600 border-green-200">Aprovado</Badge>;
      case 'fail':
        return <Badge variant="destructive">Falhou</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-200">Atenção</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Important':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'Good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) acc[check.category] = [];
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, SEOCheck[]>);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analisando SEO da página...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO Health Check
          </CardTitle>
          <CardDescription>
            Análise completa de SEO da página atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passCount}</div>
              <div className="text-sm text-muted-foreground">Aprovados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Atenção</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failCount}</div>
              <div className="text-sm text-muted-foreground">Falhas</div>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={performSEOChecks} variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Reanalizar
            </Button>
            <Button onClick={testSocialSharing} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Testar Compartilhamento
            </Button>
          </div>

          {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                {getCategoryIcon(category)}
                {category}
              </h3>
              <div className="space-y-2">
                {categoryChecks.map(check => (
                  <div key={check.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.title}</div>
                        <div className="text-sm text-muted-foreground">{check.description}</div>
                        {check.details && (
                          <div className="text-xs text-muted-foreground mt-1">{check.details}</div>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOChecker;