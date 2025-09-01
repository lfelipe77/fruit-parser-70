import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ProfileUpdates = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  instagram?: string | null;
  website_url?: string | null;
  // add other optional fields your form supports
};

type SaveArgs = {
  updates: ProfileUpdates;
  avatarFile?: Blob | File | null; // optional; pass only when changed
};

export function useProfileSave() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async ({ updates, avatarFile }: SaveArgs) => {
    setSaving(true);
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('Not signed in');

      let avatarUrl: string | null = null;

      // 1) If there is a new avatar, upload it with the correct key pattern
      if (avatarFile) {
        const key = `${user.id}/avatar.webp`; // policy requires folder = user.id
        const { error: upErr } = await supabase
          .storage
          .from('avatars')
          .upload(key, avatarFile, { upsert: true, contentType: 'image/webp' });
        if (upErr) throw upErr;

        // Bucket is public per policy, so we can store the public URL
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(key);
        avatarUrl = pub?.publicUrl ?? null;
      }

      // 2) Ensure profile row exists (harmless if it already does; trigger also creates it)
      try {
        await supabase.from('user_profiles').insert({ id: user.id });
      } catch {
        // Profile already exists, continue
      }

      // 3) Build final update payload
      const payload: Record<string, any> = {
        ...updates,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        updated_at: new Date().toISOString(),
      };

      // 4) Persist
      const { data, error: dbErr } = await supabase
        .from('user_profiles')
        .update(payload)
        .eq('id', user.id)
        .select()
        .maybeSingle();

      if (dbErr) throw dbErr;
      return data;
    } catch (e: any) {
      setError(e.message ?? 'Failed to save profile');
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { save, saving, error };
}