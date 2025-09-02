// Standardized avatar source getter - use this everywhere in the app
export function getAvatarSrc(profile?: { avatar_url?: string | null; updated_at?: string | null }, userId?: string): string {
  // First priority: profile.avatar_url with cache-busting from updated_at
  if (profile?.avatar_url) {
    const cacheBuster = profile.updated_at 
      ? `?v=${new Date(profile.updated_at).getTime()}` 
      : `?v=${Date.now()}`;
    return `${profile.avatar_url}${cacheBuster}`;
  }
  
  // Second priority: construct default path if we have userId
  if (userId) {
    return `https://whqxpuyjxoiufzhvqneg.supabase.co/storage/v1/object/public/avatars/${userId}/avatar.webp`;
  }
  
  // Fallback: placeholder image
  return "/img/avatar-placeholder.png";
}

// Alternative version that includes cache-busting for constructed URLs
export function getAvatarSrcWithCacheBust(profile?: { avatar_url?: string | null; updated_at?: string | null }, userId?: string): string {
  if (profile?.avatar_url) {
    const cacheBuster = profile.updated_at 
      ? `?v=${new Date(profile.updated_at).getTime()}` 
      : `?v=${Date.now()}`;
    return `${profile.avatar_url}${cacheBuster}`;
  }
  
  if (userId) {
    const timestamp = Date.now();
    return `https://whqxpuyjxoiufzhvqneg.supabase.co/storage/v1/object/public/avatars/${userId}/avatar.webp?v=${timestamp}`;
  }
  
  return "/img/avatar-placeholder.png";
}