import React from 'react';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface NetworkStatusProps {
  isOnline?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
}

export function NetworkStatus({ isOnline = true, hasError = false, onRetry }: NetworkStatusProps) {
  if (isOnline && !hasError) return null;

  return (
    <Alert variant={!isOnline ? "destructive" : "default"} className="mb-4">
      <div className="flex items-center gap-2">
        {!isOnline ? <WifiOff className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        <AlertDescription className="flex-1">
          {!isOnline ? (
            "No internet connection. Please check your network."
          ) : hasError ? (
            "Something went wrong. Please try again."
          ) : null}
        </AlertDescription>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );
}

// Hook to monitor network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}