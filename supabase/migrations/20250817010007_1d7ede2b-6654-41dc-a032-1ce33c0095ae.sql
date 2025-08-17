-- Create RLS policies for public read access to transactions and tickets
DROP POLICY IF EXISTS "tx_public_read" ON public.transactions;
CREATE POLICY "tx_public_read" ON public.transactions 
FOR SELECT TO anon, authenticated 
USING (true);

DROP POLICY IF EXISTS "tk_public_read" ON public.tickets;
CREATE POLICY "tk_public_read" ON public.tickets 
FOR SELECT TO anon, authenticated 
USING (true);

-- Ensure users can insert their own transactions and tickets
DROP POLICY IF EXISTS "tx_insert_own" ON public.transactions;
CREATE POLICY "tx_insert_own" ON public.transactions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "tk_insert_own" ON public.tickets;
CREATE POLICY "tk_insert_own" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());