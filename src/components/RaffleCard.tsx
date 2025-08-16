import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { formatBRL } from "@/lib/formatters";

type CardRow = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  ticket_price: number;
  amount_raised: number;
  goal_amount: number;
  progress_pct_money: number;
  last_paid_at: string | null;
  created_at?: string | null; // added
  category_name?: string | null;
  subcategory_name?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  participants_count?: number | null; // optional
};

export default function RaffleCard({ r }: { r: CardRow }) {
  const pct = Math.max(0, Math.min(100, r.progress_pct_money ?? 0));
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
          <Progress value={pct} className="h-2" />
          
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
          {(() => {
            const when = r.last_paid_at ?? r.created_at;
            const label = r.last_paid_at ? "Última venda" : "Lançado";
            return when ? <span>{label}: {useRelativeTime(when, "pt-BR")}</span> : null;
          })()}
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