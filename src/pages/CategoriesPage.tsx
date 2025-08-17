import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { CategoriasSEO } from "@/components/SEOPages";

type CategoryRow = {
  id: string | number;
  slug: string;
  nome: string;
  icone_url: string | null;
  descricao: string | null;
  destaque: boolean;
  active_raffles?: number;
};

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('ganhavel_categories_public')
        .select('*')
        .order('nome', { ascending: true });

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
        <h1 className="text-2xl font-semibold mb-6">Categorias</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((c) => (
            <Link
              key={c.id}
              to={`/categorias/${c.slug}`}
              className="border rounded-2xl p-6 hover:shadow-md transition group bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-medium">{c.nome}</h2>
                {c.destaque && (
                  <span className="text-xs px-2 py-1 rounded-full border bg-primary/10 text-primary">
                    🌟 Destaque
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {c.descricao || "Explore ganhaveis nesta categoria"}
              </p>

              <div className="text-sm text-muted-foreground mb-4">
                Ativas: <span className="font-semibold text-foreground">{c.active_raffles || 0}</span>
              </div>

              {c.icone_url && (
                <img
                  src={c.icone_url}
                  alt={c.nome}
                  className="h-10 w-10 object-contain opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}