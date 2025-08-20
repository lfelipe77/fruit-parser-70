export const brl = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(Number(n ?? 0));

export const shortDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("pt-BR") : "";

export function toComboString(input: unknown): string {
  console.log("[toComboString] Input:", input, "Type:", typeof input);
  
  try {
    if (typeof input === "string") {
      const result = input.replace(/[^\d-]/g, "");
      console.log("[toComboString] String result:", result);
      return result;
    }
    if (Array.isArray(input)) {
      const flat = (input as unknown[]).flat(2).map(x => String(x).replace(/[^\d]/g, ""));
      const result = flat.filter(Boolean).join("-");
      console.log("[toComboString] Array result:", result);
      return result;
    }
    const result = String(input ?? "").replace(/[^\d-]/g, "");
    console.log("[toComboString] Default result:", result);
    return result;
  } catch (error) {
    console.log("[toComboString] Error:", error);
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