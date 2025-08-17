import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { formatBRL } from "@/lib/formatters";
import { RaffleCardInfo } from "@/types/public-views";

type CardRow = RaffleCardInfo & {
  description?: string | null;
  created_at?: string | null;
  category_name?: string | null;
  subcategory_name?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  participants_count?: number | null;
};

export default function RaffleCard({ r }: { r: CardRow }) {
  // Use backend progress_pct_money with defensive fallback
  const pct = r.progress_pct_money ?? (
    r.goal_amount > 0 
      ? Math.min(100, Math.max(0, Math.round((r.amount_raised / r.goal_amount) * 100)))
      : 0
  );
  const last = useRelativeTime(r.last_paid_at, "pt-BR");
  const loc = [r.location_city, r.location_state].filter(Boolean).join(", ");

  return (
    <Link to={`/ganhavel/${r.id}`} className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      {r.image_url ? (
        <img src={r.image_url} alt={r.title} className="h-48 w-full object-cover" />
      ) : (
        <div className="h-48 w-full bg-muted" />
      )}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">{r.title}</h3>
        
        {/* Description */}
        {r.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
        )}

        {/* Location */}
        {loc && (
          <div className="text-sm text-muted-foreground">{loc}</div>
        )}

        {/* Amount raised and goal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-lg">
            <span className="font-semibold text-foreground">{formatBRL(r.amount_raised)}</span>
            <span className="text-muted-foreground">de {formatBRL(r.goal_amount)}</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          
          {/* Progress info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{pct}% arrecadado</span>
            {!!r.participants_count && (
              <span className="text-muted-foreground">{r.participants_count} participantes</span>
            )}
          </div>
        </div>

        {/* Last purchase or launch date */}
        <div className="text-sm text-muted-foreground">
          {r.last_paid_at ? (
            <span>Última venda: {useRelativeTime(r.last_paid_at, "pt-BR")}</span>
          ) : (
            <span>—</span>
          )}
        </div>

        {/* Location (second instance as in your example) */}
        {loc && (
          <div className="text-sm text-muted-foreground">{loc}</div>
        )}

        {/* Buy button */}
        <button className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Comprar Bilhete
        </button>
      </div>
    </Link>
  );
}