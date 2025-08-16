// src/adapters/raffleAdapters.ts
export type MoneyRow = {
  id: string; title: string; description: string | null; image_url: string | null;
  status: string; ticket_price: number; draw_date: string | null;
  category_name: string | null; subcategory_name: string | null;
  amount_raised: number; goal_amount: number; progress_pct_money: number; last_paid_at: string | null;
  created_at?: string | null; // novo (veio da view)
};

export type RaffleExtras = {
  user_id: string | null; vendor_url: string | null;
  location_city: string | null; location_state: string | null;
  details_html?: string | null; regulation_html?: string | null;
  prize_details?: string | null; description_long?: string | null;
  created_at?: string | null;   // quando lido direto da tabela base
  funded_at?: string | null; completed_at?: string | null;
  draw_source?: string | null; draw_ref?: string | null;
  winning_numbers?: any; winners?: any;
};

export function toRaffleView(m: Partial<MoneyRow>, e?: Partial<RaffleExtras>) {
  const pct = Math.max(0, Math.min(100, Number(m.progress_pct_money ?? 0)));
  const createdAt = m.created_at ?? e?.created_at ?? null;
  const lastPaidAt = m.last_paid_at ?? null;

  return {
    id: m.id!,
    title: m.title ?? "Rifa",
    img: m.image_url ?? "",
    descShort: m.description ?? "",
    status: m.status ?? "inactive",
    ticketPrice: Number(m.ticket_price ?? 0),
    drawDate: m.draw_date ?? null,
    cat: m.category_name ?? null,
    subcat: m.subcategory_name ?? null,
    raised: Number(m.amount_raised ?? 0),
    goal: Number(m.goal_amount ?? 0),
    pct,
    lastPaidAt,
    createdAt,                                // usar na UI
    location: [e?.location_city, e?.location_state].filter(Boolean).join(", "),
    vendorUrl: e?.vendor_url ?? null,
    detalhesHtml: e?.details_html || e?.description_long || m.description || null,
    regulamentoHtml: e?.regulation_html || null,
    ownerUserId: e?.user_id ?? null,
    fundedAt: e?.funded_at ?? null,
    drawSource: e?.draw_source ?? null,
    drawRef: e?.draw_ref ?? null,
    winningNumbers: e?.winning_numbers ?? null,
    winners: e?.winners ?? null,
    completedAt: e?.completed_at ?? null,
  };
}