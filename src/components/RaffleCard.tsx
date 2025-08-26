import { brl, timeAgo } from "@/types/raffles";
import { RaffleCardInfo } from "@/types/public-views";
import { Link } from "react-router-dom";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
}

export function RaffleCard({ r }: { r: RaffleCardInfo }) {
  const pct = Math.max(0, Math.min(100, r.progress_pct_money ?? 0));
  const moneyNow = r.amount_raised ?? 0;
  const moneyGoal = r.goal_amount ?? 0;
  const cityState = [r.location_city, r.location_state].filter(Boolean).join(" • ");

  return (
    <Link to={`/ganhavel/${r.id}`} className="group block overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden rounded-lg">
        {r.image_url ? (
          <img src={r.image_url} alt={r.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        
        {/* Organizer avatar (no link) */}
        <div className="absolute top-2 right-2">
          {r.organizer_avatar_url ? (
            <img
              src={r.organizer_avatar_url}
              alt={r.organizer_display_name || 'Organizador'}
              className="h-6 w-6 rounded-full ring-2 ring-white shadow"
              loading="lazy"
            />
          ) : (
            <div
              className="h-6 w-6 rounded-full bg-muted-foreground/20 ring-2 ring-white shadow flex items-center justify-center text-[10px] font-semibold text-muted-foreground"
              aria-label={r.organizer_display_name || 'Organizador'}
              title={r.organizer_display_name || 'Organizador'}
            >
              {getInitials(r.organizer_display_name || 'O')}
            </div>
          )}
        </div>
      </div>

      {/* Title + excerpt */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold leading-snug line-clamp-1">{String(r.title ?? '')}</h3>
        {r.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{String(r.description ?? '')}</p>
        )}

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
          <div>{r.last_paid_at ? `Última venda: ${timeAgo(r.last_paid_at)}` : "Sem vendas ainda"}</div>
          {cityState && <div>{cityState}</div>}
        </div>

        {/* CTA */}
        <div className="w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground group-hover:bg-primary/90 transition-colors">
          Comprar Bilhete
        </div>
      </div>
    </Link>
  );
}

export default RaffleCard;