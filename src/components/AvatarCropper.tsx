import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedBlobFromImage } from "@/lib/cropImage";

type Props = {
  src: string;                  // data URL to crop
  open: boolean;
  onClose: () => void;
  onCropped: (blob: Blob) => void; // returns webp blob
};

export default function AvatarCropper({ src, open, onClose, onCropped }: Props) {
  const [crop, setCrop] = useState<{x:number;y:number}>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<{width:number;height:number;x:number;y:number} | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_area: any, areaPx: any) => {
    setAreaPixels(areaPx);
  }, []);

  async function handleSave() {
    if (!areaPixels) return;
    try {
      setBusy(true);
      const blob = await getCroppedBlobFromImage(src, crop, zoom, areaPixels, "image/webp", 0.9);
      onCropped(blob);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-lg overflow-hidden grid">
        <div className="relative w-full h-[360px] bg-black">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            minZoom={1}
            maxZoom={4}
          />
        </div>
        <div className="p-4 flex items-center justify-between gap-3">
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-48"
          />
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded bg-muted text-muted-foreground hover:bg-muted/80">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={busy}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Gerando…" : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}