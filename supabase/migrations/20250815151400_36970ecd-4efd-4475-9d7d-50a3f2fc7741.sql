-- Owner can read their own raffles (all statuses including under_review)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'raffles' 
        AND policyname = 'owner_read_own_raffles'
    ) THEN
        CREATE POLICY "owner_read_own_raffles"
        ON public.raffles FOR SELECT
        TO authenticated
        USING (owner_user_id = auth.uid());
    END IF;
END
$$;