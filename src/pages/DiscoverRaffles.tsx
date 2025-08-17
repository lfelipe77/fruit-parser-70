import Navigation from "@/components/Navigation";
import { DescobrirSEO } from "@/components/SEOPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryStats, formatCurrency, formatDate, getProgressPercent } from "@/types/raffles";
import { RafflePublicMoney } from "@/types/public-views";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import RaffleCard from "@/components/RaffleCard";
import { Link } from "react-router-dom";

const PAGE_SIZE = 12;

export default function DiscoverRaffles() {
  const [raffles, setRaffles] = useState<RafflePublicMoney[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      
      const mapped = (data || []).map(cat => ({
        id: cat.id,
        name: cat.nome,
        slug: cat.slug,
        active_count: 0,
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

  // Load raffles
  useEffect(() => {
    async function loadRaffles() {
      setLoading(true);
      let query = (supabase as any)
        .from('raffles_public_money_ext')
        .select('id,title,description,image_url,status,ticket_price,goal_amount,amount_raised,progress_pct_money,last_paid_at,created_at,draw_date,category_name,subcategory_name', { count: "exact" });

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      if (selectedCategory) {
        const catName = categories.find(c => c.id === selectedCategory)?.name;
        if (catName) {
          query = query.eq("category_name", catName);
        }
      }

      // Apply sorting - default to newest first
      switch (sortBy) {
        case "ending-soon":
          query = query.order("last_paid_at", { ascending: true });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "popularity":
          query = query.order("progress_pct_money", { ascending: false });
          break;
        case "goal":
          query = query.order("goal_amount", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const offset = currentPage * PAGE_SIZE;
      query = query.range(offset, offset + PAGE_SIZE - 1);

      const { data, error, count } = await query;
      
      if (!error) {
        setRaffles((data || []) as RafflePublicMoney[]);
        setTotalCount(count || 0);
      }
      setLoading(false);
    }
    
    loadRaffles();
  }, [searchTerm, selectedCategory, sortBy, currentPage]);


  const SkeletonCard = () => (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="aspect-[16/10] bg-gray-100 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
        <div className="h-2 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
      </div>
    </div>
  );

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory(null);
    setCurrentPage(0);
  };

  const handleSearch = () => {
    setCurrentPage(0);
  };

  const hasMorePages = (currentPage + 1) * PAGE_SIZE < totalCount;

  return (
    <div className="min-h-screen bg-background">
      <DescobrirSEO />
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Descobrir Ganhaveis
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Explore milhares de ganhaveis incríveis e encontre seu próximo prêmio dos sonhos
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-4 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Pesquisar ganhaveis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" className="h-12 px-8" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80 transition-colors"
                onClick={() => setSelectedCategory(null)}
              >
                Todos
              </Badge>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name} ({category.active_count})
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm font-medium">Ordenar por:</span>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Mais Populares</SelectItem>
                  <SelectItem value="ending-soon">Encerrando em Breve</SelectItem>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="goal">Maior Valor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {selectedCategory === null 
                  ? "Todos os Ganhaveis" 
                  : `Ganhaveis de ${categories.find(c => c.id === selectedCategory)?.name}`}
              </h2>
              <p className="text-muted-foreground">
                {totalCount} ganhaveis encontrados
                {searchTerm && ` para "${searchTerm}"`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : raffles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {raffles.map((raffle) => (
                  <RaffleCard key={raffle.id} r={raffle} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!hasMorePages}
                >
                  Próxima
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum ganhavel encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar seus filtros ou termo de busca para encontrar ganhaveis
                </p>
                <Button 
                  variant="outline" 
                  onClick={clearAllFilters}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}