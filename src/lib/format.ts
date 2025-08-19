export const brl = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(Number(n ?? 0));

export const shortDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR") : "";

export function toComboString(input: unknown): string {
  try {
    if (typeof input === "string") return input.replace(/[^\d-]/g, "");
    if (Array.isArray(input)) {
      const flat = (input as unknown[]).flat(2).map(x => String(x).replace(/[^\d]/g, ""));
      return flat.filter(Boolean).join("-");
    }
    return String(input ?? "").replace(/[^\d-]/g, "");
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