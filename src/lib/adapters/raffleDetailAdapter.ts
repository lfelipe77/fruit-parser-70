import { formatBRL, formatDateBR, withFallbackImage } from "@/lib/formatters";

// Raw database types
export type RaffleDetailRaw = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  ticket_price: number;
  draw_date: string | null;
  category_name: string | null;
  subcategory_name: string | null;
  amount_raised: number;
  goal_amount: number;
  progress_pct_money: number;
  last_paid_at: string | null;
  owner_user_id?: string | null; // TODO: wire db field
};

export type OrganizerProfileRaw = {
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

// Normalized frontend types
export type RaffleDetailNormalized = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'inactive' | 'completed';
  ticketPrice: number;
  drawDate: string | null;
  categoryName: string;
  subcategoryName: string;
  amountRaised: number;
  goalAmount: number;
  progressPercent: number;
  lastPaidAt: string | null;
  ownerUserId: string | null;
  isActive: boolean;
  drawLabel: string;
};

export type OrganizerProfileNormalized = {
  id: string;
  name: string;
  username: string;
  bio: string;
  location: string;
  memberSince: string; // TODO: wire db field from created_at
  avatar: string;
  website: string | null;
  socialLinks: {
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null; // TODO: wire db field
    youtube: string | null;
    tiktok: string | null;
    whatsapp: string | null;
    telegram: string | null;
  };
  // TODO: wire db fields for stats
  totalGanhaveisLancados: number;
  ganhaveisCompletos: number;
  totalGanhaveisParticipados: number;
  ganhaveisGanhos: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
};

// Data adapters with fallbacks
export const adaptRaffleDetail = (raw: RaffleDetailRaw | null): RaffleDetailNormalized | null => {
  if (!raw) return null;

  const progressPercent = Math.max(0, Math.min(100, raw.progress_pct_money ?? 0));
  const isActive = raw.status === 'active';
  const drawLabel = raw.draw_date ? formatDateBR(raw.draw_date) : "—";

  return {
    id: raw.id,
    title: raw.title || "Título não disponível",
    description: raw.description || "Descrição não disponível",
    imageUrl: withFallbackImage(raw.image_url, raw.title),
    status: (raw.status as any) || 'inactive',
    ticketPrice: raw.ticket_price || 0,
    drawDate: raw.draw_date,
    categoryName: raw.category_name || "Categoria",
    subcategoryName: raw.subcategory_name || "Subcategoria",
    amountRaised: raw.amount_raised || 0,
    goalAmount: raw.goal_amount || 0,
    progressPercent,
    lastPaidAt: raw.last_paid_at,
    ownerUserId: raw.owner_user_id || null,
    isActive,
    drawLabel,
  };
};

export const adaptOrganizerProfile = (raw: OrganizerProfileRaw | null): OrganizerProfileNormalized | null => {
  if (!raw) return null;

  return {
    id: raw.id,
    name: raw.full_name || raw.username || "Organizador",
    username: raw.username || "user",
    bio: raw.bio || "Organizador experiente na plataforma.",
    location: raw.location || "Brasil",
    memberSince: "Janeiro 2023", // TODO: wire db field from created_at
    avatar: withFallbackImage(raw.avatar_url, raw.username || raw.id),
    website: raw.website_url,
    socialLinks: {
      instagram: raw.instagram,
      facebook: raw.facebook,
      twitter: raw.twitter,
      linkedin: null, // TODO: wire db field
      youtube: raw.youtube,
      tiktok: raw.tiktok,
      whatsapp: raw.whatsapp,
      telegram: raw.telegram,
    },
    // TODO: wire db fields for stats - these should come from aggregated queries
    totalGanhaveisLancados: 47,
    ganhaveisCompletos: 43,
    totalGanhaveisParticipados: 156,
    ganhaveisGanhos: 2,
    avaliacaoMedia: 4.8,
    totalAvaliacoes: 234,
  };
};

// Helper for navigation
export const toConfirm = (id: string, qty: number): string => {
  return `/ganhavel/${id}/confirmacao-pagamento?qty=${qty}`;
};