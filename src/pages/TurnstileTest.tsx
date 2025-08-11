import SEOHead from "@/components/SEOHead";
import { useEffect, useRef, useState } from "react";

const SITE_KEY = "0x4AAAAAABpqGDEenRovXaTv";
const VERIFY_URL = "https://whqxpuyjxoiufzhvqneg.functions.supabase.co/verify-turnstile";

export default function TurnstileTest() {
  const outRef = useRef<HTMLPreElement>(null);
  const [ready, setReady] = useState(false);

  const log = (m: string) => {
    if (outRef.current) outRef.current.textContent += m + "\n";
  };

  useEffect(() => {
    (window as any).onTurnstileToken = async (token: string) => {
      log("Token: " + token);
      try {
        const r = await fetch(VERIFY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const j = await r.json();
        log("Verify response: " + JSON.stringify(j));
      } catch (e: any) {
        console.error(e);
        log("Error: " + (e?.message || "unknown error"));
      }
    };

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setReady(true);
    document.head.appendChild(script);

    return () => {
      delete (window as any).onTurnstileToken;
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  return (
    <>
      <SEOHead
        title="Turnstile Test – Cloudflare CAPTCHA verification"
        description="Live Turnstile token test page that verifies tokens via Supabase function."
        canonical="https://ganhavel.com/turnstile-test"
      />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Turnstile Token Test</h1>
        <div
          className="cf-turnstile mt-4"
          data-sitekey={SITE_KEY}
          data-callback="onTurnstileToken"
        />
        <pre ref={outRef} className="mt-4 p-3 border rounded-md text-sm" aria-live="polite" />
        {!ready && <p className="text-muted-foreground text-sm mt-2">Loading Turnstile…</p>}
      </main>
    </>
  );
}
