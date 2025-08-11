import { useEffect, useRef } from "react";

const SITE_KEY = "0x4AAAAAABpqGDEenRovXaTv"; // <-- exact site key
const VERIFY_URL = "https://whqxpuyjxoiufzhvqneg.functions.supabase.co/verify-turnstile";

export default function TurnstileTest() {
  const outRef = useRef<HTMLPreElement>(null);
  const log = (m: string) => { if (outRef.current) outRef.current.textContent += m + "\n"; };

  // Expose callback globally for Turnstile
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).onTurnstileToken = async (token: string) => {
    log("Token: " + token);
    const r = await fetch(VERIFY_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const j = await r.json();
    log("Verify response: " + JSON.stringify(j));
  };

  useEffect(() => {
    // Ensure the script is only added once
    if (!document.getElementById("cf-turnstile-script")) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true; s.defer = true;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h3>Turnstile Token Test</h3>
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-callback="onTurnstileToken" />
      <pre ref={outRef} style={{ padding: 12, border: "1px solid #ddd", marginTop: 16, whiteSpace: "pre-wrap" }} />
    </main>
  );
}
