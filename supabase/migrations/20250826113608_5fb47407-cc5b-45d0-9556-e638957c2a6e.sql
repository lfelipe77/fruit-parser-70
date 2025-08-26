-- Extend raffles_public_money_ext view to include organizer profile data
DROP VIEW IF EXISTS public.raffles_public_money_ext;

CREATE VIEW public.raffles_public_money_ext AS
SELECT 
  r.id,
  r.title,
  r.description,
  left(r.description, 100) as description_excerpt,
  r.image_url,
  r.status,
  r.ticket_price,
  r.goal_amount,
  r.created_at,
  r.draw_date,
  r.location_city,
  r.location_state,
  cat.nome as category_name,
  cat.slug as category_slug,
  sub.nome as subcategory_name,
  sub.slug as subcategory_slug,
  COALESCE(money.amount_raised, 0) as amount_raised,
  money.last_paid_at,
  COALESCE(money.participants_count, 0) as participants_count,
  COALESCE(money.progress_pct_money, 0) as progress_pct_money,
  r.direct_purchase_link,
  -- Organizer profile data
  r.user_id as organizer_user_id,
  up.full_name as organizer_name,
  up.display_name as organizer_display_name,
  up.username as organizer_username,
  up.avatar_url as organizer_avatar_url
FROM public.raffles r
LEFT JOIN public.categories cat ON r.category_id = cat.id
LEFT JOIN public.ganhavel_categories sub ON r.subcategory_id = sub.id
LEFT JOIN public.raffles_money_view money ON r.id = money.raffle_id
LEFT JOIN public.user_profiles up ON r.user_id = up.id
WHERE r.status IN ('active', 'scheduled', 'completed');