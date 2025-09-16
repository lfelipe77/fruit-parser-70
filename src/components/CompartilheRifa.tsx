import { useMemo, useRef, useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Share2 } from "lucide-react";
import { buildPrettyShareUrl, buildPrettyShareUrlSync, type RaffleLike } from "@/lib/shareUrl";
import { supabase } from "@/integrations/supabase/client";
import ShareButton from "@/components/ShareButton";

type Props = { raffle: RaffleLike; size?: number; className?: string };

export default function CompartilheRifa({ raffle, size = 168, className }: Props) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState<string>(() => buildPrettyShareUrlSync(raffle));

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


  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <QRCodeCanvas value={url} size={100} includeMargin ref={qrRef as any} />
        </div>

        <ShareButton
          url={url}
          raffle={raffle}
          variant="default"
          size="sm"
        />
      </div>
    </div>
  );
}

function notify(msg: string) {
  try { (window as any).toast?.success?.(msg); }
  catch { try { (window as any).toast?.(msg); } catch { alert(msg); } }
}