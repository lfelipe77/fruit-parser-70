import { Link } from "react-router-dom";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Navigation() {
  const [open, setOpen] = React.useState(false);
  const [avatar, setAvatar] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id;
        if (!uid) return;
        const { data: row } = await supabase.from("user_profiles")
          .select("avatar_url").eq("id", uid).maybeSingle();
        setAvatar(row?.avatar_url ?? null);
      } catch {}
    })();
  }, []);

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur">
      <div className="max-w-6xl mx-auto p-3 flex items-center justify-end">
        <button 
          onClick={() => setOpen((v) => !v)} 
          className="h-9 w-9 rounded-full overflow-hidden ring-1 ring-gray-200"
        >
          {avatar ? (
            <img src={avatar} alt="meu avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
        </button>
        {open && (
          <div className="absolute mt-2 right-3 w-48 rounded-xl border bg-white shadow">
            <Link className="block px-3 py-2 hover:bg-gray-50" to="/dashboard">Dashboard</Link>
            <Link className="block px-3 py-2 hover:bg-gray-50" to="/profile">Meu Perfil</Link>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50"
              onClick={async () => { await supabase.auth.signOut(); location.href = "#/"; }}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}