// Local types for public views to avoid TypeScript issues
export type RafflePublic = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: 'active' | 'completed';
  ticket_price: number;
  total_tickets: number | null;
  draw_date: string | null;
  category_id: number | null;
  subcategory_id: number | null;
  category_name: string | null;
  subcategory_name: string | null;
  paid_tickets: number;
  progress_pct: number;
};

export type RafflePublicMoney = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  ticket_price: number;
  total_tickets: number | null; // only for goal calc (NOT displayed)
  draw_date: string | null;
  category_id: string | number | null;
  subcategory_id: string | number | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount_raised: number;
  goal_amount: number;
  progress_pct_money: number;   // 0..100
  last_paid_at: string | null;  // date only (used for time-ago)
};

export type PublicProfile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website_url: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  telegram: string | null;
};