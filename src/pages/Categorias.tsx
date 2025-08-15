import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { CategoriasSEO } from "@/components/SEOPages";

type CategoryStat = {
  id: number;
  name: string;
  slug: string;
  icon_name: string | null;
  color_class: string | null;
  featured: boolean;
  sort_order: number;
  ganhavel_count: number;
};

export default function Categorias() {
  const [cats, setCats] = React.useState<CategoryStat[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data, error } = await supabase
          .from("category_stats")
          .select("*")
          .order("featured", { ascending: false })
          .order("name", { ascending: true });
        if (error) throw error;
        if (!cancelled) setCats((data ?? []) as CategoryStat[]);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || "Falha ao carregar categorias");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (err) return <div className="p-6 text-red-700">{err}</div>;

  return (
    <div className="min-h-screen bg-background">
      <CategoriasSEO />
      <Navigation />
      <section className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Categorias</h1>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-4 bg-white">
                <div className="h-16 bg-gray-100 rounded mb-3 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cats.map((c) => (
              <Link
                key={c.id}
                to={`/descobrir?cat=${encodeURIComponent(c.slug)}`}
                className="group rounded-2xl border p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="h-16 w-full bg-gray-50 rounded flex items-center justify-center overflow-hidden">
                  {c.icon_name ? (
                    <img
                      src={c.icon_name}
                      alt={c.name}
                      className="h-12 object-contain group-hover:scale-[1.03] transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">sem ícone</span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="font-semibold leading-tight">{c.name}</div>
                  <div className="text-sm text-gray-600">{c.ganhavel_count} ganhavéis</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
