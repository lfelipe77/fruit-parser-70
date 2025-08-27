-- Step 2: CLEANUP - Cancel duplicate transactions for buyer and their tickets (FIXED)
with me(uid) as (values ('16fff918-2142-4583-99eb-758e1d0dc390'::uuid))
, victims as (
  select id
  from (
    select
      t.id,
      row_number() over (
        partition by coalesce(t.buyer_user_id, t.user_id), t.raffle_id, t.amount::numeric, date_trunc('second', t.created_at)
        order by t.created_at asc
      ) as rn
    from public.transactions t, me
    where coalesce(t.buyer_user_id, t.user_id) = me.uid
      and t.status='paid'
  ) z
  where rn > 1
)
update public.transactions tx
set status = 'canceled'
where tx.id in (select id from victims);

-- Cancel tickets tied to those canceled transactions
update public.tickets k
set status = 'canceled', updated_at = now()
where k.transaction_id in (
  select id from public.transactions where status='canceled'
)
and k.status = 'paid';