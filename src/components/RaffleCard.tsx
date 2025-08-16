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
    <Link to={`/ganhavel/${r.id}`} className="group block overflow-hidden rounded-2xl border bg-white shadow-sm hover:shadow-md">
      {r.image_url ? (
        <img src={r.image_url} alt={r.title} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-gray-100" />
      )}
      <div className="p-4">
        <div className="mb-1 flex gap-2 text-xs text-gray-600">
          {r.category_name && <span className="rounded bg-gray-100 px-2 py-0.5">{r.category_name}</span>}
          {loc && <span className="rounded bg-gray-100 px-2 py-0.5">{loc}</span>}
        </div>
        <h3 className="line-clamp-1 text-lg font-semibold">{r.title}</h3>
        {r.description && <p className="mt-1 line-clamp-2 text-sm text-gray-700">{r.description}</p>}

        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-medium">{formatBRL(r.amount_raised)}</span>
          <span className="text-gray-500">de {formatBRL(r.goal_amount)}</span>
        </div>
        <div className="mt-2">
          <Progress value={pct} className="h-2" />
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
          <span>{pct}% arrecadado</span>
          {!!r.participants_count && <span>{r.participants_count} participantes</span>}
        </div>
        <div className="mt-2 text-xs text-gray-500">Última compra: {last}</div>

        <button className="mt-3 w-full rounded-xl bg-emerald-500 px-3 py-2 text-sm text-white">
          Comprar bilhete
        </button>
      </div>
    </Link>
  );
}