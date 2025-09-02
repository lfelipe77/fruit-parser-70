import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Validate file type and size before processing
function validateAvatarFile(file: File | Blob): void {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('Image too large (max 5MB)');
  }
  
  if (file instanceof File && !allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, and WebP are allowed');
  }
}

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

      // 1) If there is a new avatar, validate and upload it
      if (avatarFile) {
        validateAvatarFile(avatarFile);
        
        const key = `${user.id}/avatar.webp`; // policy requires folder = user.id
        const { error: upErr } = await supabase
          .storage
          .from('avatars')
          .upload(key, avatarFile, { upsert: true, contentType: 'image/webp' });
        if (upErr) throw upErr;

        // Bucket is public per policy, so we can store the public URL with cache-busting
        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(key);
        avatarUrl = pub?.publicUrl ? `${pub.publicUrl}?v=${Date.now()}` : null;
      }

      // 2) Build final update payload (only allow known columns)
      const allowedKeys = new Set([
        'full_name',
        'username',
        'bio',
        'location',
        'instagram',
        'website_url',
        'avatar_url',
      ]);

      const base: Record<string, any> = {
        ...updates,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };
      const payload = Object.fromEntries(
        Object.entries(base).filter(([k, v]) => allowedKeys.has(k) && v !== undefined)
      );

      // 3) Use UPSERT to handle both INSERT and UPDATE cases
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, ...payload }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Profile upsert error:', error);
        throw error;
      }
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