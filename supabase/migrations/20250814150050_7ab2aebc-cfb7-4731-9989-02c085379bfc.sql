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

-- Add some seed data to existing raffles table if empty
INSERT INTO public.raffles (title, description, product_name, product_value, total_tickets, ticket_price, status, user_id)
SELECT 'iPhone 15 Pro', 'Ganhe um iPhone 15 Pro', 'iPhone 15 Pro', 999999, 1000, 1000, 'active', (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.raffles) AND EXISTS (SELECT 1 FROM auth.users);