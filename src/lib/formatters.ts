export const formatBRL = (n: number | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 })
    .format(n ?? 0);

export const formatDateBR = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d);
};

export const withFallbackImage = (url?: string | null, seed: string = "placeholder") =>
  url && url.trim().length > 0 ? url : `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/500`;