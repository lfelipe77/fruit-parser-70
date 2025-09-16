import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isUUID, appUrlFor } from "@/lib/urlHelpers";
import GanhaveisDetail from "./GanhaveisDetail";

export default function GanhavelPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [raffle, setRaffle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const fetchRaffle = async () => {
      try {
        let query;

        // If it looks like a UUID, search by id first
        if (isUUID(slug)) {
          query = supabase
            .from("raffles")
            .select("id, slug, title, description")
            .eq("id", slug)
            .single();
        } else {
          // Otherwise search by slug
          query = supabase
            .from("raffles")
            .select("id, slug, title, description")
            .eq("slug", slug)
            .single();
        }

        const { data, error } = await query;

        if (error || !data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setRaffle(data);

        // If we found by UUID but have a slug, redirect to canonical URL
        if (isUUID(slug) && data.slug && data.slug.trim()) {
          const canonicalUrl = appUrlFor(data);
          navigate(canonicalUrl, { replace: true });
          return;
        }

        // If we found by slug but the URL slug doesn't match, redirect
        if (!isUUID(slug) && data.slug !== slug) {
          const canonicalUrl = appUrlFor(data);
          navigate(canonicalUrl, { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching raffle:", error);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchRaffle();
  }, [slug, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  // Pass the raffle data to GanhaveisDetail via a prop or context
  // For now, let GanhaveisDetail handle its own fetching
  return <GanhaveisDetail />;
}
