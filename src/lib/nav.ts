export const toConfirm = (id: string, qty: number) =>
  `/ganhavel/${id}/confirmacao-pagamento?qty=${Math.max(1, qty)}`;