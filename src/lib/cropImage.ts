export async function getCroppedBlobFromImage(
  imageSrc: string,
  crop: { x: number; y: number },
  zoom: number,
  areaPixels: { width: number; height: number; x: number; y: number },
  mime: string = "image/webp",
  quality = 0.9
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D not supported");

  // Crop area pixels come already in the original image scale
  canvas.width = areaPixels.width;
  canvas.height = areaPixels.height;

  ctx.drawImage(
    image,
    areaPixels.x,
    areaPixels.y,
    areaPixels.width,
    areaPixels.height,
    0,
    0,
    areaPixels.width,
    areaPixels.height
  );

  // Export as WebP to reduce size
  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), mime, quality)
  );
  return blob;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}