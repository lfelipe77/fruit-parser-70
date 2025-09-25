-- Create public-safe wrapper around existing winners view with enriched profile data
CREATE OR REPLACE VIEW public.v_public_winners_pubnames AS
SELECT
  w.winner_id,
  w.raffle_id,
  w.raffle_title,
  w.ticket_id,
  w.user_id,
  COALESCE(pub.username, w.winner_handle, 'Ganhador Anônimo') as winner_handle,
  COALESCE(NULLIF(pub.avatar_url,''), w.avatar_url) as avatar_url,
  w.federal_target,
  w.winning_ticket,
  w.concurso_number,
  w.draw_date,
  w.logged_at
FROM public.v_public_winners w
LEFT JOIN public.user_profiles_public pub
  ON pub.id = w.user_id;

GRANT SELECT ON public.v_public_winners_pubnames TO anon, authenticated;