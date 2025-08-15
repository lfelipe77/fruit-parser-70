import React from "react";
import { Link } from "react-router-dom";
import { RafflePublic } from "@/types/public-views";
import ProgressBar from "@/components/ui/progress-bar";
import CategoryBadge from "@/components/ui/category-badge";
import { formatBRL, formatDateBR, withFallbackImage } from "@/lib/formatters";

type Props = { 
  r: RafflePublic; 
  onClick?: (id: string) => void;
};

export default function RaffleCard({ r, onClick }: Props) {
  if (onClick) {
    // If custom onClick provided, use div with click handler
    return (
      <div
        className="group relative grid cursor-pointer overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
        role="button"
        onClick={() => onClick(r.id)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(r.id);
          }
        }}
      >
        <CardContent />
      </div>
    );
  }

  // Default behavior: use Link for proper routing
  return (
    <Link
      to={`/ganhavel/${r.id}`}
      className="group relative grid overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
    >
      <CardContent />
    </Link>
  );

  function CardContent() {
    return (
      <>
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <img
            src={withFallbackImage(r.image_url, r.id)}
            alt={r.title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {r.category_name && <CategoryBadge name={r.category_name} colorClass={null} />}
            {r.subcategory_name && <CategoryBadge name={r.subcategory_name} className="hidden sm:inline-flex" />}
          </div>
          {r.status === "completed" && (
            <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">Encerrada</span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-sm font-semibold text-card-foreground">{r.title}</h3>
            <div className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground">
              {formatBRL(r.ticket_price)}
            </div>
          </div>

          <ProgressBar value={r.progress_pct} />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {r.paid_tickets}/{r.total_tickets ?? 0} bilhetes
            </span>
            {r.draw_date && <span>Sorteio: {formatDateBR(r.draw_date)}</span>}
          </div>
        </div>
      </>
    );
  }

}