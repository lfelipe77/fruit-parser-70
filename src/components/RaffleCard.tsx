import { brl, timeAgo, RaffleCardInfo } from "@/types/raffles";
import { Link, useNavigate } from "react-router-dom";
import { appUrlFor } from "@/lib/urlHelpers";

type RaffleCardProps = {
  r?: RaffleCardInfo;
  raffle?: {
    id: string;
    title?: string | null;
    image_url?: string | null;
    status?: string | null;
    amount_raised?: number | null;
    progress_pct_money?: number | null;
    participants_count?: number | null;
    last_paid_at?: string | null;
    location_city?: string | null;
    location_state?: string | null;
    location_display?: string | null;
    goal_amount?: number | null;
    slug?: string | null;
  };
  showBuy?: boolean;
  onView?: () => void;
};

export function RaffleCard({ r, raffle, showBuy = true, onView }: RaffleCardProps) {
  const navigate = useNavigate();
  
  // Use either r or raffle prop for backward compatibility
  const data = r || raffle;
  if (!data?.id) return null;

  // Harden all numeric values with proper fallbacks
  const pct = Math.max(0, Math.min(100, Number(data.progress_pct_money) || 0));
  const moneyNow = Math.max(0, Number(data.amount_raised) || 0);
  const moneyGoal = Math.max(0, Number(data.goal_amount) || 0);
  
  // Fix location duplication
  const state = data.location_state || "";
  const city = data.location_city || "";
  const cityState = city && state && city !== state 
    ? [city, state].join(" • ")
    : (city || state);

  // Generate clean URL
  const raffleUrl = appUrlFor({ id: data.id, slug: data.slug });

  // Navigate to ganhavel detail page
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('a, button')) return;
    
    if (onView) {
      onView();
    } else {
      navigate(raffleUrl);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView();
    } else {
      navigate(raffleUrl);
    }
  };

  return (
    <div 
      data-testid={`raffle-card-${data.id}`}
      className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="h-44 w-full overflow-hidden rounded-lg">
        {data.image_url ? (
          <img 
            src={data.image_url} 
            alt={String(data.title || 'Ganhável')} 
            className="h-full w-full object-cover" 
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.className = "h-full w-full bg-muted";
              }
            }}
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      {/* Title + excerpt */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold leading-snug line-clamp-1">{String(data.title || 'Ganhável')}</h3>
        {data.location_display && (
          <div className="text-sm text-muted-foreground">
            {data.location_display}
          </div>
        )}
        
        {/* Money line */}
        <p className="text-sm">
          <span className="font-semibold">{brl(moneyNow)}</span> de <span>{brl(moneyGoal)}</span>
        </p>

        {/* Green progress bar (server truth) */}
        <div className="h-2 rounded bg-muted overflow-hidden">
          <div 
            data-testid="raffle-progress"
            className="h-2 bg-green-500" 
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-xs" data-testid={`progress-pct-${data.id}`}>{pct}% arrecadado</p>

        {/* Participants + last sale */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>{Number(data.participants_count || 0)} participantes</div>
          <div>{data.last_paid_at ? `Última venda: ${timeAgo(data.last_paid_at)}` : "Sem vendas ainda"}</div>
        </div>

        {/* CTA */}
        <button
          data-testid="view-button"
          onClick={handleButtonClick}
          className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showBuy ? 'Comprar Bilhete' : 'Ver Ganhável'}
        </button>
      </div>
    </div>
  );
}

export default RaffleCard;