import { brl, timeAgo, RaffleCardInfo } from "@/types/raffles";
import { Link } from "react-router-dom";

export function RaffleCard({ r }: { r: RaffleCardInfo }) {
  const pct = Math.max(0, Math.min(100, r.progress_pct_money ?? 0));
  const moneyNow = r.amount_raised ?? 0;
  const moneyGoal = r.goal_amount ?? 0;
  // Fix location duplication - if city and state are the same, show only once
  const cityState = r.location_city && r.location_state && r.location_city !== r.location_state 
    ? [r.location_city, r.location_state].filter(Boolean).join(" • ")
    : (r.location_city || r.location_state || "");

  return (
    <div className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="h-44 w-full overflow-hidden rounded-lg">
        {r.image_url ? (
          <img src={r.image_url} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
      </div>

      {/* Title + excerpt */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold leading-snug line-clamp-1">{String(r.title ?? '')}</h3>
        {/* Removed description display from card */}

        {/* Money line */}
        <p className="text-sm">
          <span className="font-semibold">{brl(moneyNow)}</span> de <span>{brl(moneyGoal)}</span>
        </p>

        {/* Green progress bar (server truth) */}
        <div className="h-2 rounded bg-muted overflow-hidden">
          <div className="h-2 bg-green-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs">{pct}% arrecadado</p>

        {/* Participants + last sale */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>{Number(r.participants_count ?? 0)} participantes</div>
          <div className="flex justify-between items-center">
            <span>{r.last_paid_at ? `Última venda: ${timeAgo(r.last_paid_at)}` : "Sem vendas ainda"}</span>
            {cityState && <span className="text-primary font-medium">{cityState}</span>}
          </div>
        </div>

        {/* CTA */}
        <Link to={`/ganhavel/${r.id}`} className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          Comprar Bilhete
        </Link>
      </div>
    </div>
  );
}

export default RaffleCard;