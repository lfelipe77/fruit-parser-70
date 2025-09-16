import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, Copy, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildPrettyShareUrl, type RaffleLike } from "@/lib/shareUrl";

interface ShareButtonProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  raffle?: RaffleLike;
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
  
  // Use pretty URL if raffle data is available, otherwise fallback to provided url or current location
  const shareUrl = raffle 
    ? buildPrettyShareUrl(raffle)
    : (url || window.location.href).includes('/#/ganhavel/') 
      ? (url || window.location.href).replace('/#/ganhavel/', '/ganhavel/')
      : (url || window.location.href);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
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

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    let platformUrl = "";

    switch (platform) {
      case "facebook":
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "twitter":
        platformUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case "linkedin":
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "whatsapp":
        platformUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
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
          className={variant === "default" && size === "lg" ? 
            "bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" : 
            undefined
          }
        >
          <Share2 className="h-4 w-4" />
          {size !== "sm" && <span className="ml-2">Compartilhar</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
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