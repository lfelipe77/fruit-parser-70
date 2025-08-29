import React, { useState, useEffect } from 'react';
import { getMaskedEnvInfo, isDebugMode, type MaskedEnvInfo } from '@/utils/envDebug';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bug, ExternalLink, Minimize2, Maximize2 } from 'lucide-react';

interface DiagResult {
  status: 'loading' | 'success' | 'error';
  message: string;
}

export function DebugBanner() {
  const [envInfo, setEnvInfo] = useState<MaskedEnvInfo | null>(null);
  const [diagResult, setDiagResult] = useState<DiagResult>({ status: 'loading', message: 'Running diagnostics...' });
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!isDebugMode()) return;

    const info = getMaskedEnvInfo();
    setEnvInfo(info);

    // Run quick diagnostic
    runQuickDiag();
  }, []);

  const runQuickDiag = async () => {
    try {
      const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
      const testUrl = `${supabaseUrl}/functions/v1/payment-status?ping=1`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Don't include auth for ping test
        }
      });

      if (response.ok) {
        setDiagResult({
          status: 'success',
          message: `payment-status responded ${response.status}`
        });
      } else {
        setDiagResult({
          status: 'error',
          message: `payment-status responded ${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      setDiagResult({
        status: 'error',
        message: `payment-status unreachable: ${error instanceof Error ? error.message : 'unknown error'}`
      });
    }
  };

  if (!isDebugMode() || !envInfo) return null;

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
          <Maximize2 className="w-3 h-3 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card className="bg-yellow-50 border-yellow-300 shadow-lg">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Debug Mode</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('/_diag', '_blank')}
                className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0 text-yellow-600 hover:text-yellow-800"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-yellow-700">Build:</span>
              <span className="font-mono text-yellow-800">{envInfo.buildId}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-yellow-700">Host:</span>
              <span className="font-mono text-yellow-800">{envInfo.supabaseHost}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-yellow-700">Key:</span>
              <span className="font-mono text-yellow-800">{envInfo.anonKeyLast4}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-yellow-700">Mode:</span>
              <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-800">
                {envInfo.mode}
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t border-yellow-200">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                diagResult.status === 'loading' ? 'bg-yellow-400 animate-pulse' :
                diagResult.status === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs text-yellow-700">{diagResult.message}</span>
            </div>
          </div>

          <div className="text-xs text-yellow-600 italic">
            Remove ?debug=1 to hide
          </div>
        </div>
      </Card>
    </div>
  );
}