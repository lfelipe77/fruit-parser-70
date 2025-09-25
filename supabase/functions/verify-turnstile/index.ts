import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { withCORS } from "../_shared/cors.ts";


const securityHeaders = {
  "X-Frame-Options": "DENY",
  "Frame-Options": "DENY",
  "Frame-ancestors": "'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co https://whqxpuyjxoiufzhvqneg.functions.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; object-src 'none';",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

serve(withCORS(async (req: Request) => {
  const startTime = Date.now();
  
  try {
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method);
      return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...securityHeaders },
      });
    }

    const body = await req.json().catch((e) => {
      console.error("Failed to parse JSON body:", e);
      return {};
    });
    
    // Accept both 'token' and Cloudflare's 'cf-turnstile-response' keys
    const token = (body as any)?.token ?? (body as any)?.["cf-turnstile-response"] ?? (body as any)?.cf_turnstile_response;

    console.log("Received verification request:", {
      hasToken: !!token,
      tokenPrefix: token ? token.slice(0, 10) + "..." : "missing",
      bodyKeys: Object.keys(body),
      timestamp: new Date().toISOString()
    });

    if (!token || typeof token !== "string" || token.length < 10) {
      console.error("Invalid or missing token:", { hasToken: !!token, tokenType: typeof token, tokenLength: token?.length });
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Missing or invalid token",
        errorCodes: ["missing-input-response"] 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...securityHeaders },
      });
    }

    const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY environment variable is not set");
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Server misconfiguration",
        errorCodes: ["internal-error"]
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...securityHeaders },
      });
    }

    // Get client IP for validation (helps prevent replay attacks)
    const ip = req.headers.get("cf-connecting-ip") || 
               req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") ||
               "unknown";

    console.log("Preparing Turnstile verification:", {
      secretPresent: !!secret,
      clientIP: ip,
      tokenLength: token.length
    });

    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip !== "unknown") {
      formData.append("remoteip", ip);
    }

    const verifyStartTime = Date.now();
    console.log("Sending request to Cloudflare Turnstile API...");

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Supabase-Edge-Function"
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 seconds timeout
    });

    const verifyDuration = Date.now() - verifyStartTime;
    console.log(`Cloudflare API response received in ${verifyDuration}ms:`, {
      status: verifyRes.status,
      statusText: verifyRes.statusText,
      headers: Object.fromEntries(verifyRes.headers.entries())
    });

    if (!verifyRes.ok) {
      console.error("Cloudflare API returned error status:", verifyRes.status, verifyRes.statusText);
      return new Response(JSON.stringify({ 
        success: false, 
        message: "Verification service unavailable",
        errorCodes: ["network-error"]
      }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...securityHeaders },
      });
    }

    const verifyJson = await verifyRes.json().catch((e) => {
      console.error("Failed to parse Cloudflare response as JSON:", e);
      throw new Error("Invalid JSON response from verification service");
    });

    console.log("Cloudflare verification result:", {
      ...verifyJson,
      // Don't log the actual challenge timestamp for security
      challenge_ts: verifyJson.challenge_ts ? "[REDACTED]" : undefined
    });

    const { success, "error-codes": errorCodes, challenge_ts, hostname } = verifyJson as { 
      success: boolean; 
      "error-codes"?: string[]; 
      challenge_ts?: string;
      hostname?: string;
    };

    const totalDuration = Date.now() - startTime;
    
    if (!success) {
      const sanitizedErrorCodes = errorCodes || ["unknown-error"];
      console.error("Turnstile verification failed", { 
        errorCodes: sanitizedErrorCodes,
        hostname,
        verificationDuration: verifyDuration,
        totalDuration
      });
      
      // Map common error codes to user-friendly messages
      const errorMessages = {
        "missing-input-secret": "Server configuration error",
        "invalid-input-secret": "Server configuration error", 
        "missing-input-response": "Missing verification token",
        "invalid-input-response": "Invalid verification token",
        "bad-request": "Malformed verification request",
        "timeout-or-duplicate": "Token has expired or already been used",
        "internal-error": "Verification service error"
      };
      
      const primaryError = sanitizedErrorCodes[0] || "unknown-error";
      const userMessage = errorMessages[primaryError as keyof typeof errorMessages] || "Verification failed";
      
      return new Response(JSON.stringify({ 
        success: false, 
        errorCodes: sanitizedErrorCodes,
        message: userMessage
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...securityHeaders },
      });
    }

    console.log("Turnstile verification successful", {
      hostname,
      verificationDuration: verifyDuration,
      totalDuration,
      timestamp: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Verification successful"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...securityHeaders },
    });
    
  } catch (e) {
    const totalDuration = Date.now() - startTime;
    console.error("Unexpected error in verify-turnstile:", {
      error: e instanceof Error ? e.message : 'Unknown error',
      stack: e instanceof Error ? e.stack : undefined,
      totalDuration,
      timestamp: new Date().toISOString()
    });
    
    // Don't expose internal error details to client
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Internal server error",
      errorCodes: ["internal-error"]
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...securityHeaders },
    });
  }
}));
