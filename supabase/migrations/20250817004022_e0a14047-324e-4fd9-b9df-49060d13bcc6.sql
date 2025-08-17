-- Check RLS policies for transactions and tickets tables and add missing ones if needed

-- Transactions policies
CREATE POLICY IF NOT EXISTS "tx_insert_own" ON public.transactions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "tx_select_own" ON public.transactions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Tickets policies  
CREATE POLICY IF NOT EXISTS "tk_insert_own" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "tk_select_own" ON public.tickets
FOR SELECT TO authenticated
USING (user_id = auth.uid());