export type RaffleCardInfo = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  ticket_price: number | null;
  goal_amount: number | null;
  amount_raised: number | null;
  progress_pct_money: number | null; // authoritative green bar %
  last_paid_at: string | null;
  created_at: string | null;
  draw_date: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  location_city: string | null;
  location_state: string | null;
  participants_count: number | null;
};

export type CategoryStats = {
  id: number;
  name: string;
  slug: string;
  active_count: number;
  icon_name: string | null;
  icone_url: string | null;
  color_class: string | null;
  sort_order: number | null;
  featured: boolean | null;
};

export type SubcategoryStats = {
  id: string;
  name: string;
  slug: string;
  category_id: number;
  active_count: number;
};

// Helper functions
export const brl = (v?: number | null) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "R$ 0,00";

export const timeAgo = (iso?: string | null) => {
  if (!iso) return "Sem vendas ainda";
  const t = new Date(iso).getTime();
  const s = Math.floor((Date.now() - t) / 1000);
  const m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `há ${d} ${d === 1 ? "dia" : "dias"}`;
  if (h > 0) return `há ${h} ${h === 1 ? "hora" : "horas"}`;
  if (m > 0) return `há ${m} ${m === 1 ? "min" : "mins"}`;
  return "agora mesmo";
};

export const formatCurrency = (amount: number | null | undefined): string => {
  return Number(amount ?? 0).toLocaleString("pt-BR", { 
    style: "currency", 
    currency: "BRL" 
  });
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  });
};

export const getProgressPercent = (progress: number | null): number => {
  return Math.max(0, Math.min(100, Number(progress || 0)));
};