import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import RaffleCard from "@/components/RaffleCard";
import { Badge } from "@/components/ui/badge";

type CategoryInfo = {
  nome: string;
  icone_url: string | null;
};

type SubcategoryInfo = {
  id: string | number;
  slug: string;
  nome: string;
  category_slug: string;
  active_raffles: number;
};

type SubcatRow = {
  id: string | number;
  slug: string;
  nome: string;
  category_slug: string;
  sort_order: number;
  active_raffles: number;
};

type RaffleRow = {
  id: string;
  title: string;
  image_url: string | null;
  status: string;
  category_slug: string | null;
  subcategory_slug: string | null;
  amount_raised: number | null;
  goal_amount: number | null;
  progress_pct_money: number | null;
  last_paid_at: string | null;
  ticket_price: number | null;
  created_at: string | null;
};

export default function SubcategoryDetailPage() {
  const { categorySlug, subSlug } = useParams<{ categorySlug: string; subSlug: string }>();
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [subcategoryInfo, setSubcategoryInfo] = useState<SubcategoryInfo | null>(null);
  const [subcategories, setSubcategories] = useState<SubcatRow[]>([]);
  const [raffles, setRaffles] = useState<any[]>([]);
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
    const interval = setInterval(() => {
      if (categorySlug && subSlug) {
        fetchRaffles(categorySlug, subSlug);
      }
    }, 30000); // safety refresh
    return () => { 
      window.removeEventListener('raffleUpdated', handleRaffleUpdate); 
      clearInterval(interval); 
    };
  }, [categorySlug, subSlug]);

  const fetchRaffles = async (catSlug: string, subSlug: string) => {
    const { data, error } = await supabase
      .from('raffles_public_money_ext')
      .select('*')
      .order('created_at', { ascending: false })
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
        const subInfoQuery = await (supabase as any)
          .from('subcategory_stats')
          .select('*')
          .eq('category_slug', categorySlug)
          .eq('subcategory_slug', subSlug)
          .maybeSingle();

        if (subInfoQuery.error) {
          console.error("[SubcategoryDetail] Subcategory error:", subInfoQuery.error);
          setError("Subcategoria não encontrada");
          setLoading(false);
          return;
        }

        if (subInfoQuery.data) {
          const sub = subInfoQuery.data;
          setSubcategoryInfo({
            id: sub.id,
            slug: sub.subcategory_slug,
            nome: sub.subcategory_name,
            category_slug: sub.category_slug,
            active_raffles: sub.raffles_count
          });
        }

        // Fetch all subcategories for chips  
        const subsQuery = await (supabase as any)
          .from('subcategory_stats')
          .select('*')
          .eq('category_slug', categorySlug)
          .order('subcategory_name');

        if (subsQuery.error) {
          console.error("[SubcategoryDetail] All subcategories error:", subsQuery.error);
        } else {
          const mappedSubs = (subsQuery.data || []).map((sub: any) => ({
            id: sub.id,
            slug: sub.subcategory_slug,
            nome: sub.subcategory_name,
            category_slug: sub.category_slug,
            sort_order: 0,
            active_raffles: sub.raffles_count
          }));
          setSubcategories(mappedSubs);
        }

        // Fetch raffles
        const RAFFLE_CARD_SELECT =
          "id,title,description,image_url,status," +
          "ticket_price,goal_amount,amount_raised,progress_pct_money," +
          "last_paid_at,created_at,draw_date," +
          "category_name,subcategory_name," +
          "location_city,location_state,participants_count";

        const { data: raffles, error: raffErr } = await (supabase as any)
          .from('raffles_public_money_ext')
          .select(RAFFLE_CARD_SELECT)
          .eq('category_slug', categorySlug)
          .eq('subcategory_slug', subSlug)
          .order('created_at', { ascending: false })
          .limit(60);

        if (raffErr) {
          console.error("[SubcategoryDetail] raffles error:", raffErr);
        } else {
          setRaffles(raffles || []);
        }

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
          
          <h2 className="text-xl text-muted-foreground mb-4">{subcategoryInfo?.nome}</h2>

          {/* Subcategory chips */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => (
                <Badge
                  key={sub.id}
                  variant={sub.slug === subSlug ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => window.location.href = `#/categorias/${categorySlug}/${sub.slug}`}
                >
                  {sub.nome} ({sub.active_raffles})
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