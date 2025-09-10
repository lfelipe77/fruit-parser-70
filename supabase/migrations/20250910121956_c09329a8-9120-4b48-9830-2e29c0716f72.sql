-- 1) Winner detail view (public-safe)
create or replace view public.v_public_raffle_winner_detail as
select
  rw.raffle_id,
  rw.ticket_id,
  rw.user_id                               as winner_user_id,
  p.username                               as winner_handle,
  p.avatar_url                             as winner_avatar_url,
  rw.ticket_number                         as winning_ticket,     -- pretty string
  case
    when rw.draw_pairs is null then null
    else array_to_string(rw.draw_pairs, '-')
  end                                       as federal_pairs,      -- "75-78-81-88-84"
  rw.drawn_number                           as federal_target,     -- "7578818884" (if stored)
  rw.concurso_number,
  rw.draw_date,
  rw.created_at                             as winner_published_at
from public.raffle_winners rw
left join public.user_profiles_public p
  on p.id = rw.user_id;

-- 2) RLS: allow read for anon/auth
alter view public.v_public_raffle_winner_detail set (security_barrier = true);
grant select on public.v_public_raffle_winner_detail to anon, authenticated;