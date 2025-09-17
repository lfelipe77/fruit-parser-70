import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { shareUrlForRaffle, copyUrlForRaffle } from "@/lib/urls";
import { supabase } from "@/integrations/supabase/client";

type RaffleLike = { id: string; slug?: string | null; title?: string; description?: string; updated_at?: string; updatedAt?: string };

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  raffle?: RaffleLike & { title?: string; description?: string };
}

export default function ShareButton({ 
  url, 
  title = "Participando do Ganhavel!",
  description = "Ganháveis justos e transparentes",
  variant = "outline",
  size = "sm",
  raffle
}: ShareButtonProps) {
  const { toast } = useToast();

  // Use sync version for initial render, will be updated async
  const fallbackUrl = raffle && raffle.slug
    ? shareUrlForRaffle({ 
        slug: raffle.slug, 
        id: raffle.id, 
        updated_at: raffle.updated_at,
        updatedAt: raffle.updatedAt 
      })
    : (url || window.location.href);

  const getUpdatedShareUrl = async (raffle: RaffleLike) => {
    try {
      const { data } = await supabase
        .from("raffles")
        .select("slug, updated_at")
        .eq("id", raffle.id)
        .maybeSingle();
      
      if (data?.slug) {
        return shareUrlForRaffle({
          slug: data.slug,
          id: raffle.id,
          updated_at: data.updated_at
        });
      }
      return shareUrlForRaffle({
        slug: raffle.slug || raffle.id,
        id: raffle.id,
        updated_at: raffle.updated_at,
        updatedAt: raffle.updatedAt
      });
    } catch {
      return fallbackUrl;
    }
  };

  const handleCopyLink = async () => {
    try {
      // Use clean copy URL for humans when copying
      const copyUrl = raffle ? copyUrlForRaffle(raffle) : fallbackUrl;
      const fullUrl = copyUrl.startsWith('http') ? copyUrl : window.location.origin + copyUrl;
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const handleNativeShare = async () => {
    try {
      // Use .html share URL for social sharing
      const shareUrl = raffle 
        ? await getUpdatedShareUrl(raffle)
        : fallbackUrl;
        
      // Build CTA-first share text
      const cta = raffle ? `✨ Participe você também deste Ganhavel e concorra a ${raffle.title || title}!` : title;
      const body = raffle?.description?.trim() ?? description;
      const shareText = [cta, body].filter(Boolean).join("\n\n");

      if (navigator.share) {
        await navigator.share({
          title: raffle?.title || title,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
      
      // Fallback to copy clean link for humans
      await handleCopyLink();
    } catch (error) {
      // User cancelled share or error occurred, fallback to copy
      await handleCopyLink();
    }
  };

  const handleShare = async (platform: string) => {
    // Use async version for sharing to ensure slug is fetched
    const shareUrl = raffle 
      ? await getUpdatedShareUrl(raffle)
      : fallbackUrl;
      
    const encodedUrl = encodeURIComponent(shareUrl);
    
    // Build CTA-first share text
    const cta = raffle ? `✨ Participe você também deste Ganhavel e concorra a ${raffle.title || title}!` : title;
    const body = raffle?.description?.trim() ?? description;
    const shareText = [cta, body].filter(Boolean).join("\n\n");
    
    const encodedText = encodeURIComponent(shareText);

    let platformUrl = "";

    switch (platform) {
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "linkedin":
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        platformUrl = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
    }

    if (platformUrl) {
      window.open(platformUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={size === "lg" ? "w-full" : "active:scale-95 transition-transform duration-150"}
        >
          <Share2 className="h-4 w-4" />
          {size !== "sm" && <span className="ml-2">Compartilhar</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink}>
          <Copy className="mr-2 h-4 w-4" />
          Copiar Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="mr-2 h-4 w-4" />
          Twitter/X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <Instagram className="mr-2 h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}