import * as React from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Convert handles/bare values into clickable hrefs
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

type Row = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  role: string | null;
  created_at: string;
  website_url: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  youtube: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  telegram: string | null;
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-xs font-medium text-gray-600">{children}</label>
);

export default function UserProfile() {
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const [uid, setUid] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [ok, setOk] = React.useState<string | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  // 👇 Single source of truth — used by BOTH view & edit (this fixes the "blank view" bug)
  const [fullName, setFullName]   = React.useState("");
  const [username, setUsername]   = React.useState("");
  const [bio, setBio]             = React.useState("");
  const [location, setLocation]   = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");

  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [instagram, setInstagram]   = React.useState("");
  const [twitter, setTwitter]       = React.useState("");
  const [facebook, setFacebook]     = React.useState("");
  const [youtube, setYoutube]       = React.useState("");
  const [tiktok, setTiktok]         = React.useState("");
  const [whatsapp, setWhatsapp]     = React.useState("");
  const [telegram, setTelegram]     = React.useState("");

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const { data: auth } = await supabase.auth.getUser();
        const id = auth.user?.id ?? null;
        if (!id) throw new Error("Você precisa estar autenticado.");
        if (!mounted) return;
        setUid(id);

        const cols =
          "id, full_name, username, avatar_url, bio, location, role, created_at, " +
          "website_url, instagram, twitter, facebook, youtube, tiktok, whatsapp, telegram";

        let { data: row, error } = await supabase
          .from("user_profiles")
          .select(cols)
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (!row) {
          const { data: created, error: insErr } = await supabase
            .from("user_profiles")
            .insert({ id })
            .select(cols)
            .single();
          if (insErr) throw insErr;
          row = created;
        }

        if (!mounted) return;
        if (row) {
          const profileData = row as any;
          setFullName(profileData.full_name ?? "");
          setUsername(profileData.username ?? "");
          setBio(profileData.bio ?? "");
          setLocation(profileData.location ?? "");
          setAvatarUrl(profileData.avatar_url ?? "");
          setWebsiteUrl(profileData.website_url ?? "");
          setInstagram(profileData.instagram ?? "");
          setTwitter(profileData.twitter ?? "");
          setFacebook(profileData.facebook ?? "");
          setYoutube(profileData.youtube ?? "");
          setTiktok(profileData.tiktok ?? "");
          setWhatsapp(profileData.whatsapp ?? "");
          setTelegram(profileData.telegram ?? "");
        }
      } catch (e: any) {
        if (mounted) setErr(e.message || "Falha ao carregar seu perfil.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !uid) return;
    try {
      setSaving(true);
      setErr(null);

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase
        .storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      setAvatarUrl(publicUrl);
      await supabase.from("user_profiles").update({ avatar_url: publicUrl }).eq("id", uid);
    } catch (e: any) {
      setErr(e.message || "Não foi possível enviar o avatar.");
    } finally {
      setSaving(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save() {
    if (!uid) return;
    try {
      setSaving(true);
      setErr(null);

      const payload = {
        full_name: fullName || null,
        username: username || null,
        bio: bio || null,
        location: location || null,
        avatar_url: avatarUrl || null,
        website_url: websiteUrl || null,
        instagram: instagram || null,
        twitter: twitter || null,
        facebook: facebook || null,
        youtube: youtube || null,
        tiktok: tiktok || null,
        whatsapp: whatsapp || null,
        telegram: telegram || null,
      };

      const { error: upErr } = await supabase
        .from("user_profiles")
        .update(payload)
        .eq("id", uid)
        .select("*")
        .single();

      if (upErr) throw upErr;

      setOk("Perfil atualizado!");
      setEdit(false);
      setTimeout(() => setOk(null), 2200);
    } catch (e: any) {
      setErr(e.message || "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  // Render skeleton if we don't have the minimal fields yet
  const ready =
    typeof fullName === "string" &&
    typeof username === "string" &&
    typeof bio === "string" &&
    typeof location === "string";

  if (!ready || loading) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
        <div className="mt-6 grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="h-40 w-40 bg-gray-100 rounded-full animate-pulse" />
          <div className="space-y-3">
            <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-gray-100 rounded animate-pulse w-1/3" />
          </div>
        </div>
      </section>
    );
  }

  if (!uid) {
    return (
      <section className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">Meu Perfil</h1>
        <p className="text-gray-700">Você precisa estar autenticado.</p>
        <Link to="/login" className="underline text-emerald-700">Entrar</Link>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Meu Perfil</h1>
        <div className="flex items-center gap-2">
          <Link to="/profile/ganhaveis" className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
            Meus Ganhavéis
          </Link>
          {!edit ? (
            <button onClick={() => setEdit(true)} className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700">
              Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={save} disabled={saving} className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700 disabled:opacity-50">
                {saving ? "Salvando…" : "Salvar"}
              </button>
              <button onClick={() => setEdit(false)} className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {err && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{err}</div>}
      {ok &&  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">{ok}</div>}

      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        {/* Avatar */}
        <div className="flex flex-col items-center md:items-start">
          <div className="relative h-40 w-40 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-200">
            {avatarUrl
              ? <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              : <div className="h-full w-full flex items-center justify-center text-gray-400">sem avatar</div>}
            {edit && (
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs shadow"
              >
                Trocar avatar
              </button>
            )}
          </div>

          {edit && (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarPick} />
              <p className="mt-2 text-xs text-gray-500">JPG/PNG. O envio substitui o avatar atual.</p>
            </>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {!edit ? (
            <>
              <div>
                <div className="text-xl font-semibold">{fullName || "Seu nome"}</div>
                <div className="text-gray-600">{username ? `@${username}` : "defina seu @usuario"}</div>
              </div>

              {bio && <p className="text-gray-800 whitespace-pre-wrap max-w-prose">{bio}</p>}
              <div className="text-sm text-gray-600">{location}</div>

              {/* Social chips */}
              <div className="flex flex-wrap gap-2 pt-3">
                {[
                  { label: "Website",   href: toHref(websiteUrl) },
                  { label: "Instagram", href: toHref(instagram, "instagram") },
                  { label: "Twitter/X", href: toHref(twitter, "twitter") },
                  { label: "TikTok",    href: toHref(tiktok, "tiktok") },
                  { label: "YouTube",   href: toHref(youtube, "youtube") },
                  { label: "Facebook",  href: toHref(facebook, "facebook") },
                  { label: "WhatsApp",  href: toHref(whatsapp, "whatsapp") },
                  { label: "Telegram",  href: toHref(telegram, "telegram") },
                ]
                  .filter(x => !!x.href)
                  .map(x => (
                    <a key={x.label} href={x.href!} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                      {x.label}
                    </a>
                  ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {username ? (
                  <Link to={`/u/${username}`} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                    Ver perfil público
                  </Link>
                ) : (
                  <span className="text-xs text-gray-500">Defina um @usuario para habilitar o perfil público.</span>
                )}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
              <div>
                <Label>@Usuário</Label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="ex: joaosilva" />
              </div>
              <div className="sm:col-span-2">
                <Label>Bio</Label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Escreva um pouco sobre você" />
              </div>
              <div>
                <Label>Localização</Label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="Cidade, País" />
              </div>

              {/* Links / socials */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Website</Label><input value={websiteUrl} onChange={(e)=>setWebsiteUrl(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="https://..." /></div>
                <div><Label>Instagram</Label><input value={instagram} onChange={(e)=>setInstagram(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="@seuusuario ou url" /></div>
                <div><Label>Twitter/X</Label><input value={twitter} onChange={(e)=>setTwitter(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="@seuusuario ou url" /></div>
                <div><Label>TikTok</Label><input value={tiktok} onChange={(e)=>setTiktok(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="@seuusuario ou url" /></div>
                <div><Label>YouTube</Label><input value={youtube} onChange={(e)=>setYoutube(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="canal ou url" /></div>
                <div><Label>Facebook</Label><input value={facebook} onChange={(e)=>setFacebook(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="página/usuário ou url" /></div>
                <div><Label>WhatsApp</Label><input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="+55 47 9..." /></div>
                <div><Label>Telegram</Label><input value={telegram} onChange={(e)=>setTelegram(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" placeholder="@usuario ou url" /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}