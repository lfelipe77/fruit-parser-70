import { useMemo, useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Share2 } from "lucide-react";
import { buildPrettyShareUrl, buildPrettyShareUrlSync, type RaffleLike } from "@/lib/shareUrl";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Props = { raffle: RaffleLike; size?: number; className?: string };

export default function CompartilheRifa({ raffle, size = 168, className }: Props) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState<string>(() => buildPrettyShareUrlSync(raffle));
  const { toast } = useToast();

  // Fetch the proper URL with slug asynchronously
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const properUrl = await buildPrettyShareUrl(raffle, supabase);
        setUrl(properUrl);
      } catch (error) {
        console.warn("Failed to fetch slug for share URL:", error);
        // Keep the sync fallback URL
      }
    };
    fetchUrl();
  }, [raffle]);

  const handleShare = async () => {
    try {
      // Ensure we have the latest URL with slug
      const shareUrl = await buildPrettyShareUrl(raffle, supabase);
      
      if (navigator.share) {
        await navigator.share({
          title: `Ganhavel - ${raffle.id}`,
          url: shareUrl,
        });
      } else {
        // Fallback to copy to clipboard
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
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <QRCodeCanvas value={url} size={100} includeMargin ref={qrRef as any} />
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1 text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto"
          aria-label="Compartilhar Ganhavel"
        >
          <Share2 className="h-3.5 w-3.5" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}
