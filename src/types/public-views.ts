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