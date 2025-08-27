-- Clean up ALL global duplicates, not just for the specific buyer
with global_victims as (
  select id
  from (
    select
      t.id,
      row_number() over (
        partition by coalesce(t.buyer_user_id, t.user_id), t.raffle_id, t.amount::numeric, date_trunc('second', t.created_at)
        order by t.created_at asc
      ) as rn
    from public.transactions t
    where t.status='paid'
  ) z
  where rn > 1
)
update public.transactions tx
set status = 'refunded'
where tx.id in (select id from global_victims);

-- Mark tickets tied to those refunded transactions as canceled  
update public.tickets k
set status = 'canceled', updated_at = now()
where k.transaction_id in (
  select id from public.transactions where status='refunded'
)
and k.status = 'paid';