import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { CategoriasSEO } from "@/components/SEOPages";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import RaffleCard from "@/components/RaffleCard";

// Data types
type Category = {
  id: string;
  slug: string;
  nome: string;
  icone_url: string | null;
  active_raffles_count: number;
};

type Subcategory = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  active_count: number;
};

type RaffleCardData = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: string;
  ticket_price: number;
  goal_amount: number;
  amount_raised: number;
  progress_pct_money: number;
  last_paid_at: string | null;
  created_at: string;
  draw_date: string | null;
  category_name: string | null;
  category_slug: string | null;
  subcategory_name: string | null;
  subcategory_slug: string | null;
  location_city: string | null;
  location_state: string | null;
  participants_count: number | null;
};

const CARD_SELECT = 
  'id,title,description,image_url,status,' +
  'ticket_price,goal_amount,' +
  'amount_raised,progress_pct_money,last_paid_at,created_at,draw_date,' +
  'category_name,category_slug,subcategory_name,subcategory_slug,' +
  'location_city,location_state,participants_count';

export default function CategoriesPage() {
  const { categorySlug, subSlug } = useParams();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [raffles, setRaffles] = useState<RaffleCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCategory = categories.find(c => c.slug === categorySlug);
  const currentSubcategory = subcategories.find(s => s.slug === subSlug);

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from('ganhavel_categories_public')
        .select('id,slug,nome,icone_url,destaque')
        .order('nome', { ascending: true });
      
      if (data) {
        const mapped = data.map(cat => ({
          id: cat.id,
          slug: cat.slug,
          nome: cat.nome,
          icone_url: cat.icone_url,
          active_raffles_count: 0 // Will be calculated from stats
        }));
        setCategories(mapped);
      }
      setLoading(false);
    }
    loadCategories();
  }, []);

  // Load subcategories when category is selected
  useEffect(() => {
    if (!categorySlug) {
      setSubcategories([]);
      return;
    }
    
    async function loadSubcategories() {
      const { data } = await supabase
        .from('subcategory_stats')
        .select('id,slug,name,category_id,active_count')
        .eq('category_id', parseInt(currentCategory?.id || '0'))
        .order('name', { ascending: true });
      
      if (data) {
        const mappedSubs = data.map(sub => ({
          ...sub,
          category_id: sub.category_id?.toString() || '0'
        }));
        setSubcategories(mappedSubs);
      }
    }
    loadSubcategories();
  }, [categorySlug]);

  // Load raffles when category or subcategory is selected
  useEffect(() => {
    if (!categorySlug) {
      setRaffles([]);
      return;
    }

    let cancelled = false;
    
    async function loadRaffles() {
      setLoading(true);
      
      let query = supabase
        .from('raffles_public_money_ext')
        .select(CARD_SELECT)
        .eq('status', 'active');
      
      if (categorySlug && currentCategory) {
        // For now, let's just get active raffles - will need proper category mapping
      }
      if (subSlug && currentSubcategory) {
        // Filter by subcategory when available
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(60);
      
      if (!cancelled) {
        if (error) {
          console.error('Error loading raffles:', error);
          setRaffles([]);
        } else {
          setRaffles((data as any) || []);
        }
        setLoading(false);
      }
    }
    
    loadRaffles();

    // Listen for raffle updates to re-fetch
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
  }, [categorySlug, subSlug]);

  // Show category not found
  if (categorySlug && !currentCategory && categories.length > 0) {
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

  // Show subcategory view with raffles
  if (currentSubcategory && currentCategory) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to={`/categorias/${categorySlug}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para {currentCategory.nome}
              </Button>
            </Link>
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {currentCategory.nome} • {currentSubcategory.name}
              </h1>
              <p className="text-muted-foreground">
                {currentSubcategory.active_count} ganhaveis disponíveis
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : raffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {raffles.map((raffle) => (
                <RaffleCard key={raffle.id} r={raffle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma ganhavel encontrada.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show category view with subcategories and raffles
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
            
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                {currentCategory.nome}
              </h1>
              <p className="text-muted-foreground">
                {currentCategory.active_raffles_count} ganhaveis disponíveis
              </p>
            </div>

            {/* Subcategory chips */}
            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {subcategories.map((subcategory) => (
                  <Link 
                    key={subcategory.id} 
                    to={`/categorias/${categorySlug}/${subcategory.slug}`}
                  >
                    <Badge 
                      variant="outline" 
                      className="px-3 py-1 hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      {subcategory.name} ({subcategory.active_count})
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : raffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {raffles.map((raffle) => (
                <RaffleCard key={raffle.id} r={raffle} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma ganhavel encontrada em {currentCategory.nome}.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show all categories grid
  return (
    <div className="min-h-screen bg-background">
      <CategoriasSEO />
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Categorias</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore todas as categorias de ganhaveis disponíveis e encontre exatamente o que você está procurando
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border bg-card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-muted rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-2 bg-muted rounded" />
                  <div className="h-2 bg-muted rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma categoria encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Category card component
function CategoryCard({ category }: { category: Category }) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    async function loadSubcategories() {
      const { data } = await supabase
        .from('subcategory_stats')
        .select('id,slug,name,active_count')
        .eq('category_id', parseInt(category.id))
        .order('active_count', { ascending: false })
        .limit(3);
      
      if (data) {
        const mappedSubs = data.map(sub => ({
          ...sub,
          category_id: category.id
        }));
        setSubcategories(mappedSubs);
      }
    }
    loadSubcategories();
  }, [category.slug]);

  return (
    <Link to={`/categorias/${category.slug}`}>
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
                       <h3 className="font-semibold text-lg">{category.nome}</h3>
                       <p className="text-sm text-muted-foreground">
                         {category.active_raffles_count} ganhaveis
                       </p>
                     </div>
          </div>
          
          {subcategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">Subcategorias:</p>
                 {subcategories.map((sub) => (
                   <div key={sub.id} className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                     <span className="text-sm">{sub.name}</span>
                     <Badge variant="outline" className="ml-auto text-xs">
                       {sub.active_count}
                     </Badge>
                   </div>
                 ))}
            </div>
          )}

           <Button className="w-full mt-4" variant="outline">
             Ver {category.nome}
           </Button>
        </CardContent>
      </Card>
    </Link>
  );
}