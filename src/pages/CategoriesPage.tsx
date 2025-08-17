import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { CategoriasSEO } from "@/components/SEOPages";

type CategoryRow = {
  id: number | string;
  slug: string;
  nome: string;
  icone_url: string | null;
  destaque?: boolean;
  active_raffles_count?: number;
};

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const query = supabase
        .from("ganhavel_categories_public")
        .select("id, slug, nome, icone_url")
        .order("nome", { ascending: true });

      const { data, error } = await query;
      if (error) {
        console.error("[Categorias] Supabase error:", error);
        setError(error.message);
      } else {
        console.log("[Categorias] rows:", data);
        setRows(data ?? []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6 text-sm opacity-70">Carregando categorias…</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6 text-red-500">Erro ao carregar categorias. Veja o console.</div>
    </div>
  );
  
  if (!rows.length) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6 opacity-70">Nenhuma categoria encontrada.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <CategoriasSEO />
      <Navigation />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-semibold mb-4">Categorias</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((c) => (
            <Link
              key={c.id}
              to={`/categorias/${c.slug}`}
              className="border rounded-2xl p-4 hover:shadow-md transition group bg-card"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium">{c.nome}</h2>
                {c.destaque ? (
                  <span className="text-xs px-2 py-1 rounded-full border">
                    🌟 Destaque
                  </span>
                ) : null}
              </div>

              <p className="text-sm mt-1 opacity-80 line-clamp-2">
                Explore ganhaveis em {c.nome}
              </p>

              <div className="mt-3 text-xs opacity-80">
                <span className="font-semibold">Ver categoria</span>
              </div>

              {/* Optional icon/image */}
              {c.icone_url ? (
                <img
                  src={c.icone_url}
                  alt={c.nome}
                  className="mt-3 h-10 w-10 object-contain opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}