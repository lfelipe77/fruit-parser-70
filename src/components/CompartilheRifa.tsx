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
    <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 ${className ?? ""}`}>
      <h3 className="mb-3 text-base md:text-lg font-semibold flex items-center gap-2">
        Compartilhe <span className="text-xs md:text-sm font-normal opacity-70">e faça acontecer</span>
      </h3>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="rounded-xl bg-white p-2 shadow-sm">
          <QRCodeCanvas value={url} size={size} includeMargin ref={qrRef as any} />
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="text-xs md:text-sm break-all opacity-80 mb-3">{url}</div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-white/20 hover:bg-white/10 transition"
              aria-label="Copiar link do ganhavel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
                <path fill="currentColor" d="M10 4H6a2 2 0 0 0-2 2v10h2V6h4z"/>
                <path fill="currentColor" d="M18 8h-6a2 2 0 0 0-2 2v8h8a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2m0 8h-6v-6h6z"/>
              </svg>
              Copiar link
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function notify(msg: string) {
  try { (window as any).toast?.success?.(msg); }
  catch { try { (window as any).toast?.(msg); } catch { alert(msg); } }
}