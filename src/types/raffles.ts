// src/types/raffles.ts
export type RaffleWithProgress = {
  id: string; 
  user_id: string;
  title: string | null; 
  status: string | null;
  goal_amount: number | null; 
  image_url: string | null;
  created_at: string;
  amount_raised: number;          // >= 0
  progress_pct_money: number;     // 0..100
};

// Re-export everything from public-views for backward compatibility
export * from './public-views';

// Additional types for admin/components  
export type RaffleRow = {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  status: string;
  ticket_price?: number;
  goal_amount?: number;
  amount_raised?: number;
  progress_pct_money?: number;
  last_paid_at?: string | null;
  created_at?: string;
  updated_at?: string;
  draw_date?: string | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  category_id?: number | null;
  subcategory_id?: string | null;
  user_id?: string;
  direct_purchase_link?: string | null;
  participants_count?: number;
  location_city?: string | null;
  location_state?: string | null;
};

export type CategoryStats = {
  id: number;
  name: string;
  slug: string;
  active_count: number;
  icone_url?: string | null;
};

export type SubcategoryStats = {
  id: number;
  name: string;
  slug: string;
  active_count: number;
};

// Re-export utility functions that were previously in this file
export { brl } from '@/lib/money';

// Create placeholder functions if they don't exist
export const timeAgo = (date: string | Date) => 'há 1 dia';
export const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
export const formatDate = (date: string | Date) => new Date(date).toLocaleDateString('pt-BR');
export const getProgressPercent = (raised: number, goal: number) => Math.round((raised / goal) * 100);