import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import RaffleCard from "@/components/RaffleCard";
import { Badge } from "@/components/ui/badge";

const CARD_SELECT = `
id,title,description,image_url,status,
ticket_price,goal_amount,
amount_raised,progress_pct_money,last_paid_at,created_at,draw_date,
category_name,category_slug,subcategory_name,subcategory_slug,
location_city,location_state,participants_count
`;

type CategoryInfo = {
  nome: string;
  icone_url: string | null;
};

type SubcategoryInfo = {
  subcategory_name: string;
};

type SubcategoryChip = {
  id: string;
  subcategory_slug: string;
  subcategory_name: string;
  raffles_count: number;
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
  category_name: string;
  category_slug: string;
  subcategory_name: string | null;
  subcategory_slug: string | null;
  location_city: string | null;
  location_state: string | null;
  participants_count: number | null;
};

export default function SubcategoryDetailPage() {
  const { categorySlug, subSlug } = useParams<{ categorySlug: string; subSlug: string }>();
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [subcategoryInfo, setSubcategoryInfo] = useState<SubcategoryInfo | null>(null);
  const [subcategories, setSubcategories] = useState<SubcategoryChip[]>([]);
  const [raffles, setRaffles] = useState<RaffleCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for real-time updates
  useEffect(() => {
    const handleRaffleUpdate = () => {
      if (categorySlug && subSlug) {
        fetchRaffles(categorySlug, subSlug);
      }
    };

    window.addEventListener('raffleUpdated', handleRaffleUpdate);
    return () => window.removeEventListener('raffleUpdated', handleRaffleUpdate);
  }, [categorySlug, subSlug]);

  const fetchRaffles = async (catSlug: string, subSlug: string) => {
    const { data, error } = await supabase
      .from("raffles_public_money_ext")
      .select(CARD_SELECT)
      .eq("category_slug", catSlug)
      .eq("subcategory_slug", subSlug)
      .order("created_at", { ascending: false })
      .limit(60);

    if (error) {
      console.error("[SubcategoryDetail] Raffles error:", error);
      return [];
    }

    console.log("[SubcategoryDetail] Raffles loaded:", data?.length);
    return data || [];
  };

  useEffect(() => {
    if (!categorySlug || !subSlug) return;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch category info
        const { data: categoryData, error: categoryError } = await supabase
          .from("ganhavel_categories_public")
          .select("nome, icone_url")
          .eq("slug", categorySlug)
          .single();

        if (categoryError) {
          console.error("[SubcategoryDetail] Category error:", categoryError);
          setError("Categoria não encontrada");
          setLoading(false);
          return;
        }

        setCategoryInfo(categoryData);

        // Fetch subcategory info
        const { data: subcatData, error: subcatError } = await supabase
          .from("subcategory_stats")
          .select("subcategory_name")
          .eq("category_slug", categorySlug)
          .eq("subcategory_slug", subSlug)
          .single();

        if (subcatError) {
          console.error("[SubcategoryDetail] Subcategory error:", subcatError);
          setError("Subcategoria não encontrada");
          setLoading(false);
          return;
        }

        setSubcategoryInfo(subcatData);

        // Fetch all subcategories for chips
        const { data: allSubcatsData, error: allSubcatsError } = await supabase
          .from("subcategory_stats")
          .select("id,subcategory_slug,subcategory_name,raffles_count")
          .eq("category_slug", categorySlug)
          .order("subcategory_name");

        if (allSubcatsError) {
          console.error("[SubcategoryDetail] All subcategories error:", allSubcatsError);
        } else {
          setSubcategories(allSubcatsData || []);
        }

        // Fetch raffles
        const raffleData = await fetchRaffles(categorySlug, subSlug);
        setRaffles(raffleData);

      } catch (err) {
        console.error("[SubcategoryDetail] General error:", err);
        setError("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    })();
  }, [categorySlug, subSlug]);

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6 text-sm opacity-70">Carregando subcategoria…</div>
    </div>
  );

  if (error || !categoryInfo || !subcategoryInfo) return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="p-6 text-red-500">{error || "Subcategoria não encontrada"}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Category & Subcategory Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{categoryInfo.nome}</h1>
            {categoryInfo.icone_url && (
              <img 
                src={categoryInfo.icone_url} 
                alt={categoryInfo.nome}
                className="h-8 w-8 object-contain"
              />
            )}
          </div>
          
          <h2 className="text-xl text-muted-foreground mb-4">{subcategoryInfo.subcategory_name}</h2>

          {/* Subcategory chips */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <Badge
                  key={sub.id}
                  variant={sub.subcategory_slug === subSlug ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => window.location.href = `#/categorias/${categorySlug}/${sub.subcategory_slug}`}
                >
                  {sub.subcategory_name} ({sub.raffles_count})
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Raffles grid */}
        {raffles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum ganhavel encontrado nesta subcategoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <RaffleCard key={raffle.id} r={raffle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}