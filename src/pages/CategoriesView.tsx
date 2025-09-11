import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { CategoriasSEO } from "@/components/SEOPages";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryStats, SubcategoryStats, formatCurrency, getProgressPercent, RaffleCardInfo } from "@/types/raffles";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import RaffleCard from "@/components/RaffleCard";
import { formatBRL } from "@/lib/formatters";

export default function CategoriesView() {
  const { categoria, subcategoria } = useParams();
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryStats[]>([]);
  const [raffles, setRaffles] = useState<RaffleCardInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = categories.find(c => c.slug === categoria);
  const currentSubcategory = subcategories.find(s => s.slug === subcategoria);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("nome", { ascending: true });
      
      const mapped = (data || []).map(cat => ({
        id: cat.id,
        name: cat.nome,
        slug: cat.slug,
        active_count: 0, // TODO: Count from raffles
        icon_name: null,
        icone_url: cat.icone_url,
        color_class: null,
        sort_order: cat.sort_order,
        featured: cat.destaque
      }));
      setCategories(mapped);
    }
    loadCategories();
  }, []);

  // Load subcategories when category is selected
  useEffect(() => {
    if (!currentCategory) return;
    
    async function loadSubcategories() {
      // For now, just show empty subcategories since we don't have the table
      setSubcategories([]);
    }
    loadSubcategories();
  }, [currentCategory?.id]);

  // Load raffles when subcategory is selected
  useEffect(() => {
    if (!currentSubcategory) {
      setRaffles([]);
      return;
    }

    let cancelled = false;
    
    async function loadRaffles() {
      setLoading(true);
      const RAFFLE_CARD_SELECT =
        "id,title,description,image_url,status," +
        "ticket_price,goal_amount,amount_raised,progress_pct_money," +
        "last_paid_at,created_at,draw_date," +
        "category_name,subcategory_name," +
        "location_city,location_state,participants_count";

      const { data } = await (supabase as any)
        .from('raffles_public_money_ext')
        .select(RAFFLE_CARD_SELECT)
        .in('status', ['active','completed'])
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (!cancelled) {
        // Add location_label for each item
        const rafflesWithLocation = ((data || []) as RaffleCardInfo[]).map(item => ({
          ...item,
          location_label: item.location_city && item.location_state 
            ? `${item.location_city} (${item.location_state})`
            : item.location_city || item.location_state || null
        }));
        setRaffles(rafflesWithLocation);
        setLoading(false);
      }
    }
    
    loadRaffles();

    // Listen for raffle updates to invalidate and re-fetch
    const handleRaffleUpdate = () => {
      if (!cancelled) {
        loadRaffles();
      }
    };

    window.addEventListener('raffleUpdated', handleRaffleUpdate);
    
    return () => { 
      cancelled = true; 
      window.removeEventListener('raffleUpdated', handleRaffleUpdate);
    };
  }, [currentSubcategory?.id]);


  // Show category not found
  if (categoria && !currentCategory && categories.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
            <Link to="/categorias">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categorias
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show subcategory detail with raffles
  if (currentSubcategory && currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to={`/categorias/${categoria}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para {currentCategory.name}
              </Button>
            </Link>
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{currentSubcategory.name}</h1>
              <p className="text-muted-foreground">
                {currentSubcategory.active_count} ganhaveis disponíveis em {currentCategory.name}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2 bg-gray-100 rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : raffles.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {raffles.map((raffle) => (
                  <RaffleCard key={raffle.id} r={raffle} />
                ))}
              </div>
              
              {raffles.length === 12 && (
                <div className="text-center mt-8">
                  <Link to="/descobrir">
                    <Button variant="outline">
                      Ver todos os ganhaveis de {currentSubcategory.name}
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Ainda não há ganhaveis em {currentSubcategory.name}. 
                Volte em breve para ver as novidades!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show category detail with subcategories
  if (currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/categorias">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Categorias
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                {currentCategory.icone_url ? (
                  <img src={currentCategory.icone_url} alt="" className="w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 bg-primary/20 rounded" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{currentCategory.name}</h1>
                <p className="text-muted-foreground">{currentCategory.active_count} ganhaveis disponíveis</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subcategories.map((subcategory) => (
              <Card key={subcategory.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{subcategory.name}</CardTitle>
                    <Badge variant="secondary">{subcategory.active_count} ganhaveis</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={`/categorias/${categoria}/${subcategory.slug}`}>
                    <Button className="w-full" variant="outline">
                      Ver todos os ganhaveis de {subcategory.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show all categories
  return (
    <div className="min-h-screen bg-background">
      <CategoriasSEO />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Todas as Categorias</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore todas as categorias de ganhaveis disponíveis e encontre exatamente o que você está procurando
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/categorias/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {category.icone_url ? (
                        <img src={category.icone_url} alt="" className="w-6 h-6" />
                      ) : (
                        <div className="w-6 h-6 bg-primary/20 rounded" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.active_count} ganhaveis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}