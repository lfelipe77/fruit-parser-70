-- Fix security issues: Enable RLS on lottery_draws table
ALTER TABLE public.lottery_draws ENABLE ROW LEVEL SECURITY;

-- RLS policies for lottery_draws
CREATE POLICY "lottery_draws_admin_read" ON public.lottery_draws
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

CREATE POLICY "lottery_draws_admin_all" ON public.lottery_draws
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Service role can access everything
CREATE POLICY "lottery_draws_service_role" ON public.lottery_draws
FOR ALL TO service_role
USING (true)
WITH CHECK (true);