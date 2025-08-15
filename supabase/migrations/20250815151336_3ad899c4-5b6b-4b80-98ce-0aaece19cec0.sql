-- Owner can read their own raffles (all statuses including under_review)
CREATE POLICY IF NOT EXISTS "owner_read_own_raffles"
ON public.raffles FOR SELECT
TO authenticated
USING (owner_user_id = auth.uid());