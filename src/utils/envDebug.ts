// Debug tools visible only with ?debug=1; safe to deploy to prod.

export interface MaskedEnvInfo {
  mode: string;
  supabaseHost: string;
  anonKeyLast4: string;
  buildId: string;
  buildTime: string;
}

function maskToken(token: string): string {
  if (!token || token.length < 8) return "****";
  return "****" + token.slice(-4);
}

function extractHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

function getBuildInfo(): { buildId: string; buildTime: string } {
  // Try to get build info from various sources
  const buildId = 
    import.meta.env.VITE_BUILD_ID || 
    import.meta.env.VITE_COMMIT_HASH ||
    import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA ||
    Date.now().toString(36).slice(-6); // fallback short hash
  
  const buildTime = 
    import.meta.env.VITE_BUILD_TIME ||
    new Date().toISOString();

  return { buildId, buildTime };
}

export function getMaskedEnvInfo(): MaskedEnvInfo {
  const supabaseUrl = "https://whqxpuyjxoiufzhvqneg.supabase.co";
  const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo";
  
  const { buildId, buildTime } = getBuildInfo();

  return {
    mode: import.meta.env.MODE || "unknown",
    supabaseHost: extractHost(supabaseUrl),
    anonKeyLast4: maskToken(anonKey),
    buildId,
    buildTime
  };
}

export function isDebugMode(): boolean {
  return new URLSearchParams(window.location.search).has('debug');
}

export function logDebugInfo(label: string, data: any): void {
  if (isDebugMode()) {
    console.log(`[DEBUG:${label}]`, data);
  }
}