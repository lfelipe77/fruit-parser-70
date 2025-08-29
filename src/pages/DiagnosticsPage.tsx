import React, { useState, useEffect } from 'react';
import { getMaskedEnvInfo, isDebugMode, type MaskedEnvInfo } from '@/utils/envDebug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

interface EndpointTest {
  name: string;
  url: string;
  method: string;
  status: 'pending' | 'success' | 'error';
  statusCode?: number;
  statusText?: string;
  responseTime?: number;
  error?: string;
}

export default function DiagnosticsPage() {
  const [envInfo, setEnvInfo] = useState<MaskedEnvInfo | null>(null);
  const [tests, setTests] = useState<EndpointTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Redirect if not in debug mode
  if (!isDebugMode()) {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    const info = getMaskedEnvInfo();
    setEnvInfo(info);
    
    // Initialize tests
    const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
    
    setTests([
      {
        name: 'payment-status (ping)',
        url: `${supabaseUrl}/functions/v1/payment-status?ping=1`,
        method: 'GET',
        status: 'pending'
      },
      {
        name: 'finalize-payment (expect 405)',
        url: `${supabaseUrl}/functions/v1/finalize-payment`,
        method: 'GET',
        status: 'pending'
      }
    ]);

    // Auto-run tests on mount
    runTests();
  }, []);

  const runTests = async () => {
    setIsRunning(true);
    const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
    
    const testConfigs = [
      {
        name: 'payment-status (ping)',
        url: `${supabaseUrl}/functions/v1/payment-status?ping=1`,
        method: 'GET'
      },
      {
        name: 'finalize-payment (expect 405)',
        url: `${supabaseUrl}/functions/v1/finalize-payment`,
        method: 'GET'
      }
    ];

    for (let i = 0; i < testConfigs.length; i++) {
      const test = testConfigs[i];
      const startTime = Date.now();

      try {
        const response = await fetch(test.url, {
          method: test.method,
          headers: {
            'Content-Type': 'application/json',
            // No auth headers for diagnostic - we want to see what happens
          }
        });

        const responseTime = Date.now() - startTime;

        setTests(prev => prev.map((t, idx) => 
          idx === i ? {
            ...t,
            status: 'success',
            statusCode: response.status,
            statusText: response.statusText,
            responseTime
          } : t
        ));

      } catch (error) {
        const responseTime = Date.now() - startTime;

        setTests(prev => prev.map((t, idx) => 
          idx === i ? {
            ...t,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime
          } : t
        ));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (test: EndpointTest) => {
    if (test.status === 'pending') {
      return <Badge variant="outline" className="text-yellow-600">Pending</Badge>;
    }
    
    if (test.status === 'error') {
      return <Badge variant="destructive">Error</Badge>;
    }

    if (test.statusCode) {
      const variant = test.statusCode < 400 ? 'default' : 
                    test.statusCode < 500 ? 'secondary' : 'destructive';
      return <Badge variant={variant}>{test.statusCode}</Badge>;
    }

    return <Badge variant="outline">Unknown</Badge>;
  };

  if (!envInfo) {
    return <div className="p-6">Loading diagnostics...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Deployment Diagnostics</h1>
            <p className="text-muted-foreground">Runtime environment and endpoint connectivity</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Testing...' : 'Re-test'}
            </Button>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Environment Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Build ID:</span>
                <span className="font-mono text-sm">{envInfo.buildId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Build Time:</span>
                <span className="font-mono text-sm">{new Date(envInfo.buildTime).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <Badge variant="outline">{envInfo.mode}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Supabase Host:</span>
                <span className="font-mono text-sm">{envInfo.supabaseHost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Anon Key:</span>
                <span className="font-mono text-sm">{envInfo.anonKeyLast4}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoint Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endpoint Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tests.map((test, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium text-sm">{test.name}</span>
                    </div>
                    {getStatusBadge(test)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="font-mono">{test.method} {test.url}</div>
                    
                    {test.status === 'success' && (
                      <div className="flex gap-4">
                        <span>Status: {test.statusCode} {test.statusText}</span>
                        {test.responseTime && <span>Time: {test.responseTime}ms</span>}
                      </div>
                    )}
                    
                    {test.status === 'error' && (
                      <div className="text-red-600">
                        Error: {test.error}
                        {test.responseTime && <span className="ml-2">({test.responseTime}ms)</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• This page is only visible with <code className="bg-muted px-1 rounded">?debug=1</code> parameter</p>
            <p>• Endpoint tests use no authentication to show base connectivity</p>
            <p>• 401/403 responses typically indicate the function exists but requires auth</p>
            <p>• 404 responses indicate the function doesn't exist or isn't deployed</p>
            <p>• 405 responses indicate wrong HTTP method (expected for GET on POST-only endpoints)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}