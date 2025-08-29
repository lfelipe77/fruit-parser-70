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

export function formatBRL(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function computeCheckout(ticketPrice: number, qtyInput: number) {
  const fee = 2.00;
  let qty = Math.max(1, Math.floor(qtyInput || 1));
  const round2 = (x: number) => Math.round(x * 100) / 100;

  let subtotal = qty * ticketPrice;
  let chargeTotal = subtotal + fee;

  if (chargeTotal < 5.00 || subtotal < 3.00) {
    const minQty = Math.ceil(3.00 / Math.max(ticketPrice, 0.000001));
    qty = Math.max(qty, minQty);
    subtotal = qty * ticketPrice;
    chargeTotal = subtotal + fee;
  }
  return { qty, fee: round2(fee), subtotal: round2(subtotal), chargeTotal: round2(chargeTotal) };
}