import { supabase } from '@/integrations/supabase/client';

// Enhanced file validation with detailed feedback
export function validateAvatarFile(file: File | Blob): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return { 
      valid: false, 
      error: `Image too large (${sizeMB}MB). Maximum size is 5MB.` 
    };
  }
  
  if (file instanceof File && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Invalid file type "${file.type}". Only PNG, JPG, and WebP are allowed.` 
    };
  }

  // Check minimum dimensions (optional)
  if (file instanceof File) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 50) {
          resolve({ valid: false, error: 'Image too small. Minimum size is 50x50 pixels.' });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => resolve({ valid: false, error: 'Invalid image file.' });
      img.src = URL.createObjectURL(file);
    }) as any;
  }
  
  return { valid: true };
}

// Compress image if it's too large (optional optimization)
export async function compressImageIfNeeded(file: File): Promise<Blob> {
  // If file is already small enough, return as-is
  if (file.size <= 1024 * 1024) { // 1MB
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 800x800)
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/webp',
        0.85 // 85% quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Rate limiting for uploads (prevent spam)
class UploadRateLimit {
  private lastUpload = 0;
  private readonly cooldown = 3000; // 3 seconds

  canUpload(): boolean {
    const now = Date.now();
    if (now - this.lastUpload < this.cooldown) {
      return false;
    }
    this.lastUpload = now;
    return true;
  }

  getTimeRemaining(): number {
    const now = Date.now();
    const remaining = this.cooldown - (now - this.lastUpload);
    return Math.max(0, remaining);
  }
}

export const uploadRateLimit = new UploadRateLimit();

// Enhanced avatar upload with retry mechanism
export async function uploadAvatarWithRetry(
  userId: string, 
  blob: Blob, 
  maxRetries = 3
): Promise<string> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[avatar] Upload attempt ${attempt}/${maxRetries}`);
      
      const filePath = `${userId}/avatar.webp`;
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { 
          upsert: true, 
          contentType: 'image/webp',
          // Add cache control for better performance
          cacheControl: '3600' // 1 hour
        });
      
      if (error) throw error;
      
      // Get public URL with cache busting
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`;
      
      console.log(`[avatar] Upload successful on attempt ${attempt}:`, avatarUrl);
      return avatarUrl;
      
    } catch (error: any) {
      lastError = error;
      console.warn(`[avatar] Upload attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`[avatar] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Upload failed after ${maxRetries} attempts: ${lastError?.message}`);
}

// Cleanup old object URLs to prevent memory leaks
export function cleanupObjectUrls(urls: string[]) {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}