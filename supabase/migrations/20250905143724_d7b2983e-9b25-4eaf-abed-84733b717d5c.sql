-- Correct backfill: validation expects flat array of 10 two-digit strings
-- ["69","00","90","00","14","00","70","00","83","00"] not [["69","00"],...]

with tx as (
  select t.id as tx_id,
         t.raffle_id,
         coalesce(t.user_id, t.buyer_user_id) as user_id,
         t.reservation_id,
         t.numbers as raw_numbers,
         r.ticket_price as unit_price
  from public.transactions t
  left join public.raffles r on r.id = t.raffle_id
  where t.status = 'paid'
), missing as (
  select tx.*
  from tx
  left join public.tickets k on k.transaction_id = tx.tx_id
  where k.id is null
), first_elem as (
  select 
    tx_id,
    raffle_id,
    user_id,
    reservation_id,
    coalesce(unit_price, 0) as unit_price,
    case
      when jsonb_typeof(raw_numbers) = 'array' then (
        select val::text
        from jsonb_array_elements(raw_numbers) with ordinality as e(val, ord)
        where ord = 1
        limit 1
      )
      else null
    end as combo
  from missing
), parsed as (
  select 
    tx_id,
    raffle_id,
    user_id,
    reservation_id,
    unit_price,
    combo,
    -- Extract and sanitize 5 numbers from hyphen-separated combo, create flat array of 10
    array[
      lpad(regexp_replace(coalesce(split_part(combo, '-', 1), '0'), '\D', '', 'g'), 2, '0'),
      '00',
      lpad(regexp_replace(coalesce(split_part(combo, '-', 2), '0'), '\D', '', 'g'), 2, '0'),
      '00',
      lpad(regexp_replace(coalesce(split_part(combo, '-', 3), '0'), '\D', '', 'g'), 2, '0'),
      '00',
      lpad(regexp_replace(coalesce(split_part(combo, '-', 4), '0'), '\D', '', 'g'), 2, '0'),
      '00',
      lpad(regexp_replace(coalesce(split_part(combo, '-', 5), '0'), '\D', '', 'g'), 2, '0'),
      '00'
    ] as flat_nums
  from first_elem
  where combo is not null
), ins as (
  insert into public.tickets (
    transaction_id,
    reservation_id,
    raffle_id,
    user_id,
    status,
    qty,
    unit_price,
    numbers
  )
  select 
    tx_id,
    reservation_id,
    raffle_id,
    user_id,
    'paid',
    5,
    unit_price,
    to_jsonb(flat_nums)
  from parsed
  returning id
)
select jsonb_build_object('inserted_tickets', count(*)) as result
from ins;