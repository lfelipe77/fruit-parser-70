-- Add RLS policies for tickets and transactions
alter table public.tickets enable row level security;
alter table public.transactions enable row level security;

-- Tickets policies
create policy "tickets_owner_read" 
on public.tickets for select 
using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "tickets_service_all" 
on public.tickets for all 
using (auth.role() = 'service_role');

-- Transactions policies  
create policy "transactions_owner_read"
on public.transactions for select
using (buyer_user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "transactions_service_all"
on public.transactions for all
using (auth.role() = 'service_role');

-- Enable RLS on other tables that don't have it
alter table public.raffle_counters enable row level security;
create policy "raffle_counters_service_only" 
on public.raffle_counters for all 
using (auth.role() = 'service_role');

alter table public.asaas_webhook_logs enable row level security;
create policy "asaas_webhook_logs_admin_only" 
on public.asaas_webhook_logs for all 
using (public.is_admin(auth.uid()));

alter table public.backup_rate_limit_attempts enable row level security;
-- Policy already exists for this table

alter table public.brazil_cities enable row level security;
create policy "brazil_cities_public_read" 
on public.brazil_cities for select 
using (true);

alter table public.brazil_states enable row level security;
create policy "brazil_states_public_read" 
on public.brazil_states for select 
using (true);