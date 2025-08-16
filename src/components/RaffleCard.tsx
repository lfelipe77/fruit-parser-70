import { Link } from "react-router-dom";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import type { RafflePublicMoney } from "@/types/public-views";
import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

type Props = {
  r: RafflePublicMoney;
  onClick?: () => void;
};

export default function RaffleCard({ r, onClick }: Props) {
  console.log('[RaffleCard] Rendering card for:', r.title);
  const progress = Math.max(0, Math.min(100, r.progress_pct_money ?? 0));
  const lastPaidAgo = useRelativeTime(r.last_paid_at, "pt-BR");
  
  // Mock participants count - you can wire this from DB later
  const participantsCount = Math.floor(Math.random() * 1000) + 100;
  
  // Mock location - you can wire this from DB later  
  const location = "São Paulo, SP";

  const CardContent = () => (
    <div className="group rounded-2xl border bg-white shadow-sm hover:shadow-md overflow-hidden transition-all">
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
        <img
          src={r.image_url || `/placeholder.svg`}
          alt={r.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-3 left-3">
          {r.category_name && (
            <Badge variant="default" className="text-xs bg-black/70 text-white border-0">
              {r.category_name}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold line-clamp-1">{r.title}</h3>
          {r.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {r.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-black">{formatBRL(r.amount_raised)}</span>
            <span className="text-gray-500">de {formatBRL(r.goal_amount)}</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 [&>div]:bg-emerald-500" />
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{progress}% arrecadado</span>
            <span>{participantsCount} participantes</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            <span>Última compra: </span>
            <span className="font-medium">{lastPaidAgo}</span>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        <button className="w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
          Comprar Bilhete
        </button>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        <CardContent />
      </div>
    );
  }

  return (
    <Link to={`/ganhavel/${r.id}`}>
      <CardContent />
    </Link>
  );
}