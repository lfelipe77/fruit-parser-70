import React from 'react';
import { useFollow } from '@/hooks/useFollow';

type Props = {
  profileUserId: string;    // id of the profile being viewed
  compact?: boolean;        // optional small size
  onChange?: (following: boolean) => void; // optional callback
};

export default function FollowButton({ profileUserId, compact, onChange }: Props) {
  const { loading, following, onToggle } = useFollow(profileUserId);

  const handleClick = async () => {
    await onToggle();
    if (onChange) onChange(!following);
  };

  const label = following ? 'Deixar de seguir' : 'Seguir';
  const className = compact
    ? 'px-2 py-1 text-sm rounded-md border'
    : 'px-3 py-2 rounded-lg border';

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className={`${className} ${following ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'} transition-colors`}
      aria-pressed={following}
    >
      {loading ? '...' : label}
    </button>
  );
}