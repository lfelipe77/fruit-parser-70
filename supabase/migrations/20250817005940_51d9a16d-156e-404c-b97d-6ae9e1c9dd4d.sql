-- Create RLS policies for public read access to transactions and tickets
CREATE POLICY IF NOT EXISTS "tx_public_read" ON public.transactions 
FOR SELECT TO anon, authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "tk_public_read" ON public.tickets 
FOR SELECT TO anon, authenticated 
USING (true);

-- Ensure users can insert their own transactions and tickets
CREATE POLICY IF NOT EXISTS "tx_insert_own" ON public.transactions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "tk_insert_own" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());