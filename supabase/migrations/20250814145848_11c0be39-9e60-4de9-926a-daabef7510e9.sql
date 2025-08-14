-- RAFFLES table
CREATE TABLE IF NOT EXISTS public.raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  price_cents int NOT NULL CHECK (price_cents >= 0),
  total_tickets int NOT NULL CHECK (total_tickets > 0),
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','closed')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TICKETS table
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number int NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE (raffle_id, number)
);

-- Enable RLS
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Helper function for admin check
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_profiles p
    WHERE p.id = uid AND p.role = 'admin'
  );
$$;

-- Raffles policies
DROP POLICY IF EXISTS "raffles_read_active" ON public.raffles;
DROP POLICY IF EXISTS "raffles_admin_rw" ON public.raffles;

CREATE POLICY "raffles_read_active"
  ON public.raffles FOR SELECT
  USING (status = 'active' OR is_admin(auth.uid()));

CREATE POLICY "raffles_admin_rw"
  ON public.raffles FOR ALL
  USING (is_admin(auth.uid()) OR created_by = auth.uid())
  WITH CHECK (is_admin(auth.uid()) OR created_by = auth.uid());

-- Tickets policies
DROP POLICY IF EXISTS "tickets_me_select" ON public.tickets;
DROP POLICY IF EXISTS "tickets_me_insert" ON public.tickets;
DROP POLICY IF EXISTS "tickets_admin_all" ON public.tickets;

CREATE POLICY "tickets_me_select"
  ON public.tickets FOR SELECT
  USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "tickets_me_insert"
  ON public.tickets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_admin_all"
  ON public.tickets FOR ALL
  USING (is_admin(auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars','avatars', false)
  ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('raffles','raffles', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars (users manage their own folder)
DROP POLICY IF EXISTS "avatars_me" ON storage.objects;
CREATE POLICY "avatars_me"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'avatars'
    AND (auth.uid()::text = split_part(name,'/',1) OR public.is_admin(auth.uid()))
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (auth.uid()::text = split_part(name,'/',1) OR public.is_admin(auth.uid()))
  );

-- Storage policies for raffles (public read, admins write)
DROP POLICY IF EXISTS "raffles_public_read" ON storage.objects;
DROP POLICY IF EXISTS "raffles_admin_rw" ON storage.objects;

CREATE POLICY "raffles_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'raffles');

CREATE POLICY "raffles_admin_rw"
  ON storage.objects FOR ALL
  USING (bucket_id = 'raffles' AND public.is_admin(auth.uid()))
  WITH CHECK (bucket_id = 'raffles' AND public.is_admin(auth.uid()));

-- Minimal seed data
INSERT INTO public.raffles (title, description, image_url, price_cents, total_tickets, status)
SELECT 'iPhone 15 Pro', 'Ganhe um iPhone 15 Pro', null, 1000, 1000, 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.raffles);