import { useMemo, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

type Props = { raffleId: string; size?: number; className?: string };

export default function CompartilheRifa({ raffleId, size = 168, className }: Props) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const url = useMemo(() => {
    if (typeof window === "undefined") return `https://ganhavel.com/ganhavel/${raffleId}`;
    return `${window.location.origin}/ganhavel/${raffleId}`;
  }, [raffleId]);

  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url; document.body.appendChild(ta);
        ta.select(); document.execCommand("copy");
        document.body.removeChild(ta);
      }
      notify("Link copiado!");
    } catch {
      notify("Não foi possível copiar. Tente novamente.");
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <QRCodeCanvas value={url} size={100} includeMargin ref={qrRef as any} />
        </div>

        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition text-sm font-medium"
          aria-label="Copiar link do ganhavel"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80">
            <path fill="currentColor" d="M10 4H6a2 2 0 0 0-2 2v10h2V6h4z"/>
            <path fill="currentColor" d="M18 8h-6a2 2 0 0 0-2 2v8h8a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m0 8h-6v-6h6z"/>
          </svg>
          Copiar link
        </button>
      </div>
    </div>
  );
}

function notify(msg: string) {
  try { (window as any).toast?.success?.(msg); }
  catch { try { (window as any).toast?.(msg); } catch { alert(msg); } }
}