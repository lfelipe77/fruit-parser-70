import * as React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// reuse the same toHref from UserProfile if you prefer; duplicated here for isolation
function toHref(v?: string | null, kind?: string) {
  if (!v) return null;
  const s = v.trim();
  if (!s) return null;
  const hasProto = /^https?:\/\//i.test(s);
  const handle = (h: string) => h.replace(/^@/, "");
  switch (kind) {
    case "instagram": return hasProto ? s : `https://instagram.com/${handle(s)}`;
    case "twitter":   return hasProto ? s : `https://x.com/${handle(s)}`;
    case "tiktok":    return hasProto ? s : `https://tiktok.com/@${handle(s)}`;
    case "youtube":   return hasProto ? s : `https://youtube.com/${s}`;
    case "facebook":  return hasProto ? s : `https://facebook.com/${handle(s)}`;
    case "telegram":  return hasProto ? s : `https://t.me/${handle(s)}`;
    case "whatsapp": {
      if (hasProto) return s;
      const digits = s.replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    }
    default:          return hasProto ? s : `https://${s}`;
  }
}

export default function PublicProfile() {
  const { username } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [row, setRow] = React.useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("user_profiles")
          .select("id, full_name, username, avatar_url, bio, location, website_url, instagram, twitter, facebook, youtube, tiktok, whatsapp, telegram")
          .eq("username", username)
          .maybeSingle();
        if (error) throw error;
        if (mounted) setRow(data ?? null);
      } catch {
        if (mounted) setRow(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [username]);

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      </section>
    );
  }

  if (!row) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-200">
          {row.avatar_url
            ? <img src={row.avatar_url} alt={row.full_name ?? row.username} className="h-full w-full object-cover" />
            : null}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{row.full_name || "Usuário"}</h1>
          <div className="text-gray-600">@{row.username}</div>
          {row.location && <div className="text-sm text-gray-600">{row.location}</div>}
        </div>
      </div>

      {row.bio && <p className="text-gray-800 whitespace-pre-wrap max-w-prose">{row.bio}</p>}

      <div className="flex flex-wrap gap-2 pt-2">
        {[
          { label: "Website",   href: toHref(row.website_url) },
          { label: "Instagram", href: toHref(row.instagram, "instagram") },
          { label: "Twitter/X", href: toHref(row.twitter, "twitter") },
          { label: "TikTok",    href: toHref(row.tiktok, "tiktok") },
          { label: "YouTube",   href: toHref(row.youtube, "youtube") },
          { label: "Facebook",  href: toHref(row.facebook, "facebook") },
          { label: "WhatsApp",  href: toHref(row.whatsapp, "whatsapp") },
          { label: "Telegram",  href: toHref(row.telegram, "telegram") },
        ]
          .filter(x => !!x.href)
          .map(x => (
            <a key={x.label} href={x.href!} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
              {x.label}
            </a>
          ))}
      </div>
    </section>
  );
}