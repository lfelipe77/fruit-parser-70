import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  validateAvatarFile, 
  compressImageIfNeeded, 
  uploadAvatarWithRetry, 
  uploadRateLimit,
  cleanupObjectUrls 
} from '@/lib/avatarUpload';

// Error formatter helper
const fmtErr = (e: any) => JSON.stringify({
  code: e?.code, 
  details: e?.details, 
  hint: e?.hint, 
  message: e?.message
}, null, 2);

// Resilient avatar + profile save function
async function saveAvatarProfileResilient(
  supabase: any,
  userId: string,
  avatarUrl: string,
  extras: Record<string, any> = {}
) {
  const now = new Date().toISOString();

  const base: Record<string, any> = {
    avatar_url: avatarUrl,
    updated_at: now,
    ...extras,
  };
  const payload = Object.fromEntries(
    Object.entries(base).filter(([, v]) => v !== undefined)
  );

  console.log('[avatar] saving profile for', userId, 'with payload:', payload);

  // Try UPDATE first
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

  // Try INSERT
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

  // Fallback: UPSERT
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

// Enhanced drop-in handler with all improvements
export async function handleAvatarSave(
  fileBlob: Blob, 
  setState?: (updater: (s: any) => any) => void,
  onProgress?: (stage: string, progress: number) => void
) {
  // Rate limiting check
  if (!uploadRateLimit.canUpload()) {
    const timeRemaining = Math.ceil(uploadRateLimit.getTimeRemaining() / 1000);
    throw new Error(`Please wait ${timeRemaining} seconds before uploading again.`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");
  const userId = user.id;

  let processedBlob = fileBlob;
  const objectUrls: string[] = [];

  try {
    onProgress?.('Validating file...', 10);
    
    // Enhanced validation
    if (fileBlob instanceof File) {
      const validation = validateAvatarFile(fileBlob);
      if (typeof validation === 'object' && 'then' in validation) {
        const result = await validation;
        if (!result.valid) throw new Error(result.error);
      } else if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    onProgress?.('Processing image...', 30);
    
    // Compress if needed
    if (fileBlob instanceof File) {
      processedBlob = await compressImageIfNeeded(fileBlob);
      console.log(`[avatar] Compressed from ${fileBlob.size} to ${processedBlob.size} bytes`);
    }

    console.log("[avatar] uploading to", `${userId}/avatar.webp`, processedBlob.type, processedBlob.size);

    onProgress?.('Uploading...', 50);
    
    // Upload with retry mechanism
    const avatarUrl = await uploadAvatarWithRetry(userId, processedBlob);
    console.log("[avatar] publicUrl", avatarUrl);

    onProgress?.('Saving profile...', 80);
    
    // Resilient save
    const row = await saveAvatarProfileResilient(supabase, userId, avatarUrl);

    onProgress?.('Complete!', 100);
    
    // Instant UI swap
    if (setState) {
      setState((s: any) => ({ ...s, avatar_url: avatarUrl }));
    }
    
    return row;
  } catch (error) {
    console.error('[avatar] Save failed:', fmtErr(error));
    throw error;
  } finally {
    // Cleanup object URLs to prevent memory leaks
    cleanupObjectUrls(objectUrls);
  }
}

// Hook for enhanced profile save with better UX
export function useEnhancedProfileSave() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string>('');

  const saveProfile = useCallback(async (updates: any, avatarFile?: File | Blob) => {
    setSaving(true);
    setError(null);
    setProgress(0);
    setStage('Starting...');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in');

      if (avatarFile) {
        // Upload avatar and save profile with new avatar URL
        setStage('Uploading avatar...');
        setProgress(25);
        
        const avatarUrl = await uploadAvatarWithRetry(user.id, avatarFile);
        
        setStage('Saving profile...');
        setProgress(75);
        
        const result = await saveAvatarProfileResilient(supabase, user.id, avatarUrl, updates);
        
        setProgress(100);
        setStage('Complete!');
        
        return result;
      } else {
        // Regular profile update without avatar - don't update avatar_url field at all
        setStage('Saving profile...');
        setProgress(50);
        
        const now = new Date().toISOString();
        const payload = {
          ...updates,
          updated_at: now,
        };
        
        // Update without touching avatar_url
        const { data, error } = await supabase
          .from('user_profiles')
          .update(payload)
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        
        setProgress(100);
        setStage('Complete!');
        
        return data;
      }
    } catch (e: any) {
      setError(e.message ?? 'Failed to save profile');
      throw e;
    } finally {
      setSaving(false);
      // Clear progress after a short delay
      setTimeout(() => {
        setProgress(0);
        setStage('');
      }, 2000);
    }
  }, []);

  return { 
    saveProfile, 
    saving, 
    error, 
    progress, 
    stage,
    clearError: () => setError(null)
  };
}

// Legacy support - keep the old hook for existing code
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
  const enhanced = useEnhancedProfileSave();
  
  const save = useCallback(async ({ updates, avatarFile }: SaveArgs) => {
    return enhanced.saveProfile(updates, avatarFile || undefined);
  }, [enhanced]);

  return {
    save,
    saving: enhanced.saving,
    error: enhanced.error
  };
}
