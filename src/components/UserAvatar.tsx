import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  avatarUrl?: string | null;
  updatedAt?: string | null;   // use for cache-busting
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10', 
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export function UserAvatar({ 
  avatarUrl, 
  updatedAt, 
  alt = 'avatar', 
  className = '', 
  size = 'md',
  fallbackText
}: UserAvatarProps) {
  // Cache-busting with updated_at timestamp or current time
  const bust = updatedAt ? `?v=${new Date(updatedAt).getTime()}` : `?v=${Date.now()}`;
  const src = avatarUrl ? `${avatarUrl}${bust}` : undefined;
  
  // Generate fallback text from alt or use provided fallbackText
  const fallback = fallbackText || (alt && alt !== 'avatar' ? alt.charAt(0).toUpperCase() : 'U');

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}