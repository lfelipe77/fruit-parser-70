import { Link } from "react-router-dom";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import type { RafflePublicMoney } from "@/types/public-views";
import { Progress } from "@/components/ui/progress";
import { formatBRL } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

type Props = {
  r: RafflePublicMoney;
  onClick?: () => void;
};

export default function RaffleCard({ r, onClick }: Props) {
  console.log('[RaffleCard] Rendering card for:', r.title);
  const progress = Math.max(0, Math.min(100, r.progress_pct_money ?? 0));
  const lastPaidAgo = useRelativeTime(r.last_paid_at, "pt-BR");

  const CardContent = () => (
    <div className="group rounded-2xl border bg-white shadow-sm hover:shadow-md overflow-hidden transition-all">
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
        <img
          src={r.image_url || `/placeholder.svg`}
          alt={r.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {r.category_name && (
            <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
              {r.category_name}
            </Badge>
          )}
          {r.subcategory_name && (
            <Badge variant="outline" className="text-xs bg-white/90 text-gray-600">
              {r.subcategory_name}
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant={r.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {r.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{r.title}</h3>
        
        <div className="mb-3 text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-emerald-600">{formatBRL(r.amount_raised)}</span>
            <span className="text-gray-500">de {formatBRL(r.goal_amount)}</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200 [&>div]:bg-emerald-500" />
          <div className="mt-1 text-xs text-gray-600">
            {progress}% arrecadado
          </div>
        </div>

        <div className="text-xs text-gray-600 mb-3">
          Última compra: {lastPaidAgo}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Bilhete: {formatBRL(r.ticket_price)}</span>
          <button className="rounded-xl bg-emerald-500 px-4 py-2 text-white text-sm hover:bg-emerald-600 transition-colors">
            Comprar
          </button>
        </div>
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