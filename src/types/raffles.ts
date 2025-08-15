export type RafflePublic = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  ticket_price: number;
  total_tickets: number | null;
  draw_date: string | null;
  category_id: number | null;
  category?: string | null;
  paid_tickets: number;
  progress_pct: number;
  goal_amount?: number;
  amount_collected?: number;
  category_name?: string | null;
  subcategory_name?: string | null;
  subcategory_id?: string | null;
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