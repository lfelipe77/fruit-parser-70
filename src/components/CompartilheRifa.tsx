import { useMemo, useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Share2 } from "lucide-react";
import { shareUrlForRaffle, copyUrlForRaffle } from "@/lib/urls";
import { type RaffleLike } from "@/lib/shareUrl";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

type Props = { raffle: RaffleLike; size?: number; className?: string };

export default function CompartilheRifa({ raffle, size = 168, className }: Props) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState<string>(() => {
    if (raffle.slug) {
      return shareUrlForRaffle({ 
        slug: raffle.slug, 
        id: raffle.id,
        updated_at: (raffle as any).updated_at,
        updatedAt: (raffle as any).updatedAt
      });
    }
    return `https://ganhavel.com/ganhavel/${raffle.id}.html?v=${raffle.id}`;
  });
  const { toast } = useToast();

  // Async fetch for better URL with slug
  useEffect(() => {
    async function fetchSlugUrl() {
      try {
        // Get latest slug if available
        const { data } = await supabase
          .from("raffles")
          .select("slug, updated_at")
          .eq("id", raffle.id)
          .maybeSingle();
        
        if (data?.slug) {
          setUrl(shareUrlForRaffle({
            slug: data.slug,
            id: raffle.id,
            updated_at: data.updated_at
          }));
        }
      } catch (error) {
        console.warn("Failed to fetch slug URL:", error);
      }
    }
    fetchSlugUrl();
  }, [raffle]);

  const handleShare = async () => {
    try {
      // Use the current URL (already .html)
      const shareUrl = url;
      
      if (navigator.share) {
        await navigator.share({
          title: `Participe da rifa: ${raffle.title || 'Ganhavel'}`,
          text: `Concorra a ${raffle.title || 'este prêmio incrível'}!`,
          url: shareUrl,
        });
        toast({
          title: "Compartilhado com sucesso!"
        });
      } else {
        // Fallback: copy to clipboard
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(shareUrl);
        } else {
          const ta = document.createElement("textarea");
          ta.value = shareUrl; 
          document.body.appendChild(ta);
          ta.select(); 
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
        toast({
          title: "Link copiado!",
          description: "O link foi copiado para a área de transferência."
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <QRCodeCanvas value={url} size={100} includeMargin ref={qrRef as any} />
        </div>

        <Button
          onClick={handleShare}
          size="lg"
          className="w-full flex items-center justify-center gap-2"
          aria-label="Compartilhar Ganhavel"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </div>
    </div>
  );
}
