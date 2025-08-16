// src/adapters/raffleAdapters.ts
export type MoneyRow = {
  id: string; title: string; description: string | null; image_url: string | null;
  status: string; ticket_price: number; draw_date: string | null;
  category_name: string | null; subcategory_name: string | null;
  amount_raised: number; goal_amount: number; progress_pct_money: number; last_paid_at: string | null;
};

export type RaffleExtras = {
  user_id: string | null; vendor_url: string | null;
  location_city: string | null; location_state: string | null;
  details_html?: string | null; regulation_html?: string | null;
  prize_details?: string | null; description_long?: string | null;
};

export function toRaffleView(m: Partial<MoneyRow>, e?: Partial<RaffleExtras>) {
  const pct = Math.max(0, Math.min(100, Number(m.progress_pct_money ?? 0)));
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
    lastPaidAt: m.last_paid_at ?? null,
    location: [e?.location_city, e?.location_state].filter(Boolean).join(", "),
    vendorUrl: e?.vendor_url ?? null,
    detalhesHtml: e?.details_html || e?.description_long || m.description || null,
    regulamentoHtml: e?.regulation_html || null,
    ownerUserId: e?.user_id ?? null,
  };
}