import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Error formatter helper
const fmtErr = (e: any) => JSON.stringify({
  code: e?.code, 
  details: e?.details, 
  hint: e?.hint, 
  message: e?.message
}, null, 2);

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

// Resilient avatar + profile save function
async function saveAvatarProfileResilient(
  supabase: any,
  userId: string,
  avatarUrl: string,
  extras: Record<string, any> = {}
) {
  const now = new Date().toISOString();

  // Build payload without undefined values
  const base: Record<string, any> = {
    avatar_url: avatarUrl,
    updated_at: now,
    ...extras,
  };
  const payload = Object.fromEntries(
    Object.entries(base).filter(([, v]) => v !== undefined)
  );

  console.log('[avatar] saving profile for', userId, 'with payload:', payload);

  // 1) Try UPDATE first (if row exists and RLS allows it)
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(payload)
      .eq('id', userId)
      .select()
      .single();

    if (!error && data) {
      console.log('[avatar] UPDATE succeeded:', data);
      return data;
    }
    if (error) {
      console.warn('[avatar] UPDATE failed → trying INSERT:', fmtErr(error));
    }
  } catch (e: any) {
    console.warn('[avatar] UPDATE exception → trying INSERT:', fmtErr(e));
  }

  // 2) Try INSERT (if row doesn't exist)
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ id: userId, ...payload })
      .select()
      .single();

    if (!error && data) {
      console.log('[avatar] INSERT succeeded:', data);
      return data;
    }
    if (error) {
      console.warn('[avatar] INSERT failed → trying UPSERT:', fmtErr(error));
    }
  } catch (e: any) {
    console.warn('[avatar] INSERT exception → trying UPSERT:', fmtErr(e));
  }

  // 3) Fallback: UPSERT
  const { data: upsertData, error: upsertErr } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, ...payload }, { onConflict: 'id' })
    .select()
    .single();

  if (upsertErr) {
    console.error('[avatar] UPSERT failed:', fmtErr(upsertErr));
    throw upsertErr;
  }
  
  console.log('[avatar] UPSERT succeeded:', upsertData);
  return upsertData;
}

// Drop-in handler for avatar upload and save
export async function handleAvatarSave(
  fileBlob: Blob, 
  setState?: (updater: (s: any) => any) => void
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");
  const userId = user.id;

  console.log("[avatar] uploading to", `${userId}/avatar.webp`, fileBlob.type, fileBlob.size);

  // 1) Upload to public bucket, replacing existing file
  const filePath = `${userId}/avatar.webp`;
  const up = await supabase.storage.from("avatars")
    .upload(filePath, fileBlob, { upsert: true, contentType: "image/webp" });
  if (up.error) {
    console.error('[avatar] Upload failed:', fmtErr(up.error));
    throw up.error;
  }

  // 2) Public URL + cache bust
  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
  const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`;
  console.log("[avatar] publicUrl", avatarUrl);

  // 3) Resilient save (UPDATE → INSERT → UPSERT)
  const row = await saveAvatarProfileResilient(supabase, userId, avatarUrl);

  // 4) Instant UI swap (ensure all avatar components read from this state)
  if (setState) {
    setState((s: any) => ({ ...s, avatar_url: avatarUrl }));
  }
  
  return row;
}

export type ProfileUpdates = {
  full_name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  instagram?: string | null;
  website_url?: string | null;
};

type SaveArgs = {
  updates: ProfileUpdates;
  avatarFile?: Blob | File | null;
};

export function useProfileSave() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async ({ updates, avatarFile }: SaveArgs) => {
    console.log('[useProfileSave] Starting save with:', { updates, hasAvatarFile: !!avatarFile });
    setSaving(true);
    setError(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('Not signed in');

      console.log('[useProfileSave] User authenticated:', user.id);
      let avatarUrl: string | null = null;

      // 1) If there is a new avatar, validate and upload it
      if (avatarFile) {
        console.log('[useProfileSave] Processing avatar file:', avatarFile.size, avatarFile.type);
        validateAvatarFile(avatarFile);
        
        const key = `${user.id}/avatar.webp`;
        console.log('[useProfileSave] Uploading to storage key:', key);
        const { error: upErr } = await supabase
          .storage
          .from('avatars')
          .upload(key, avatarFile, { upsert: true, contentType: 'image/webp' });
        if (upErr) {
          console.error('[useProfileSave] Upload error:', upErr);
          throw upErr;
        }

        const { data: pub } = supabase.storage.from('avatars').getPublicUrl(key);
        avatarUrl = pub?.publicUrl ? `${pub.publicUrl}?v=${Date.now()}` : null;
        console.log('[useProfileSave] Generated avatar URL:', avatarUrl);
      }

      // 2) Build final update payload
      const allowedKeys = new Set([
        'full_name', 'username', 'bio', 'location', 'instagram', 'website_url'
      ]);

      const base: Record<string, any> = {
        ...updates,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };
      const payload = Object.fromEntries(
        Object.entries(base).filter(([k, v]) => allowedKeys.has(k) && v !== undefined)
      );

      console.log('[useProfileSave] Final payload:', payload);

      // 3) If we have a new avatar, pass it; otherwise just update profile fields
      if (avatarUrl) {
        const result = await saveAvatarProfileResilient(supabase, user.id, avatarUrl, payload);
        console.log('[useProfileSave] Save with avatar completed:', result);
        return result;
      } else {
        // Update profile without touching avatar_url
        const now = new Date().toISOString();
        const updatePayload = { ...payload, updated_at: now };
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updatePayload)
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        console.log('[useProfileSave] Save without avatar completed:', data);
        return data;
      }
    } catch (e: any) {
      console.error('[useProfileSave] Error:', fmtErr(e));
      setError(e.message ?? 'Failed to save profile');
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { save, saving, error };
}