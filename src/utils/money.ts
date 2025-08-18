export function asNumber(n: any, fallback = 0): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

export function toBRL(n: any): string {
  const v = asNumber(n, 0);
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function toFixed2(n: any): string {
  const v = asNumber(n, 0);
  return v.toFixed(2);
}