import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    const { token } = await req.json().catch(() => ({ token: undefined }));

    if (!token) {
      return new Response(JSON.stringify({ success: false, message: "Missing token" }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (!secret) {
      console.error("TURNSTILE_SECRET_KEY is not set");
      return new Response(JSON.stringify({ success: false, message: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    // Optional: get client IP for extra validation
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || undefined;

    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const verifyJson = await verifyRes.json();
    const { success, "error-codes": errorCodes } = verifyJson as { success: boolean; "error-codes"?: string[] };

    if (!success) {
      console.warn("Turnstile verification failed", { errorCodes });
      return new Response(JSON.stringify({ success: false, errorCodes }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, ...securityHeaders },
    });
  } catch (e) {
    console.error("Unexpected error in verify-turnstile:", e);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders },
    });
  }
});
