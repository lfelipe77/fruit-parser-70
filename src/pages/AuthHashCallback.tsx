import { useEffect } from 'react';

export default function AuthHashCallback() {
  useEffect(() => {
    console.log('[oauth-hash-cb] rendered (early handler should usually navigate before this)');
  }, []);
  
  return (
    <div className="w-full h-screen flex items-center justify-center text-sm text-muted-foreground">
      Finalizando login...
    </div>
  );
}