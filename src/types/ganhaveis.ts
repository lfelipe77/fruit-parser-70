export interface GanhavelRow {
  id: string;                 // uuid
  creator_id: string | null;
  title: string;
  description: string | null;
  image_url: string | null;

  category: string | null;
  subcategory: string | null;

  ticket_price: number | null;   // numeric
  total_tickets: number | null;  // integer
  sold_tickets: number | null;   // integer

  goal_amount: number | null;    // numeric
  raised_amount: number | null;  // numeric

  status: 'active' | 'pending' | 'archived' | string;

  lottery_type: string | null;
  location: string | null;
  country_region: string | null;

  affiliate_link: string | null;
  direct_purchase_link: string | null;

  start_date: string | null;   // ISO (timestamptz)
  end_date: string | null;     // ISO

  created_at: string | null;
  updated_at: string | null;

  category_id: number | null;   // bigint in DB
  subcategory_id: string | null; // uuid
}

export type GanhavelFormData = {
  title: string;
  description: string | null;
  image_url: string | null;

  goal_amount: number | null;
  ticket_price: number | null;
  total_tickets: number | null;

  status: 'active' | 'pending' | 'archived' | string;

  product_name?: string | null; // if you added the column
  category?: string | null;
  subcategory?: string | null;

  start_date?: string | null;
  end_date?: string | null;

  location?: string | null;
  country_region?: string | null;

  affiliate_link?: string | null;
  direct_purchase_link?: string | null;
};