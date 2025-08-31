export const brl = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(Number(n ?? 0));

export const shortDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR") : "";

export function toComboString(input: unknown): string {
  try {
    if (typeof input === "string") {
      const cleaned = input.replace(/[^\d-]/g, "");
      const parts = cleaned.split('-').filter(Boolean);
      // Limit to exactly 5 pairs for lottery display
      return parts.slice(0, 5).join("-");
    }
    if (Array.isArray(input)) {
      const flat = (input as unknown[]).flat(2).map(x => String(x).replace(/[^\d]/g, ""));
      const filtered = flat.filter(Boolean);
      // Limit to exactly 5 pairs for lottery display
      return filtered.slice(0, 5).join("-");
    }
    const cleaned = String(input ?? "").replace(/[^\d-]/g, "");
    const parts = cleaned.split('-').filter(Boolean);
    // Limit to exactly 5 pairs for lottery display
    return parts.slice(0, 5).join("-");
  } catch {
    return "";
  }
}

export const statusLabel: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  approved: "Aprovado",
  success: "Confirmado",
  succeeded: "Confirmado",
  expired: "Expirado",
};