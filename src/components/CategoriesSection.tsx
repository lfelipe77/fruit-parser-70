import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchFeaturedCategories, type CategoryPublic } from "@/lib/categories";
import { Home } from "lucide-react";


export default function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryPublic[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rows = await fetchFeaturedCategories();
      if (mounted) setCategories(rows);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Categorias de Prêmios
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubra ganhaveis incríveis em diferentes categorias e encontre o prêmio dos seus sonhos
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            return (
              <Link key={category.id} to={`/categorias/${category.slug}`}>
                <Card
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                        {category.icone_url ? (
                          <img
                            src={category.icone_url}
                            alt={`Ícone da categoria ${category.nome}`}
                            loading="lazy"
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          <Home className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{category.nome}</h3>
                    {category.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {category.descricao}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
