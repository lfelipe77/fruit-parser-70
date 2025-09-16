import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useLocation, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import GanhaveisDetail from "./GanhaveisDetail";

const UUID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

export default function GanhavelPage() {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [raffle, setRaffle] = useState<any>(null);
  const [status, setStatus] = useState<"loading"|"ready"|"notfound">("loading");
  const normalizedOnce = useRef(false);

  const key = params.slug ?? params.id ?? ""; // we use one param name in routes
  const mode: "id" | "slug" = useMemo(
    () => (UUID_RE.test(key) ? "id" : "slug"),
    [key]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");

      const by = mode === "id" ? "id" : "slug";
      const { data, error } = await supabase
        .from("raffles")
        .select("id, slug, title, description")
        .eq(by, key)
        .maybeSingle();

      if (cancelled) return;

      if (error || !data) {
        setStatus("notfound");
        return;
      }

      setRaffle(data);
      setStatus("ready");

      // Normalize: if we arrived by id, move to slug once
      if (mode === "id" && data.slug && !normalizedOnce.current) {
        normalizedOnce.current = true;
        if (!location.pathname.endsWith(`/ganhavel/${data.slug}`)) {
          navigate(`/ganhavel/${data.slug}`, { replace: true });
        }
      }

      // If we arrived by slug but it's different in DB (case/encoding), normalize once
      if (mode === "slug" && data.slug && key !== data.slug && !normalizedOnce.current) {
        normalizedOnce.current = true;
        navigate(`/ganhavel/${data.slug}`, { replace: true });
      }
    })();
    return () => { cancelled = true; };
  }, [key, mode, navigate, location.pathname]);

  if (status === "loading") return <>Carregando…</>;
  if (status === "notfound") return <Navigate to="/404" replace />;

  return <RaffleView raffle={raffle} />;
}

function RaffleView({ raffle }: { raffle: any }) {
  // Add canonical tag for SEO
  useEffect(() => {
    if (!raffle?.slug) return;
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const href = `https://ganhavel.com/ganhavel/${raffle.slug}`;
    if (link) {
      link.href = href;
    } else {
      const el = document.createElement('link');
      el.rel = 'canonical';
      el.href = href;
      document.head.appendChild(el);
    }

    // Cleanup function to remove canonical tag when component unmounts
    return () => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink && canonicalLink.getAttribute('href')?.includes('/ganhavel/')) {
        canonicalLink.remove();
      }
    };
  }, [raffle?.slug]);

  return <GanhaveisDetail />;
}
