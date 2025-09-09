import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicWinners } from '@/hooks/usePublicWinners';
import { toFiveSingles, formatFiveSingles } from '@/lib/numberFormat';

function brDate(d?: string | null) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

export default function PremiadosList() {
  const { data, error, loading } = usePublicWinners(50);

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Carregando vencedores…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 text-sm text-destructive">
        Erro ao carregar vencedores: {error}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Ainda não há ganhadores publicados. Volte após o próximo sorteio.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((w) => {
        const handle = w.winner_handle ?? (w.user_id ? w.user_id.slice(0, 8) : 'ganhador');
        const profileHref = `/perfil/${encodeURIComponent(handle)}`;
        const ticketHref = w.ticket_id ? `/ticket/${w.ticket_id}` : '#';
        const raffleHref = w.raffle_id ? `/ganhavel/${w.raffle_id}` : '#';

        const federalFormatted = formatFiveSingles(toFiveSingles(w.federal_target));
        const winningFormatted = formatFiveSingles(toFiveSingles(w.winning_ticket));

        return (
          <div key={w.winner_id} className="rounded-2xl border border-border p-4 shadow-sm bg-card">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {w.avatar_url
                  ? <img src={w.avatar_url} alt="" className="h-full w-full object-cover" />
                  : <span className="text-xs text-muted-foreground">👤</span>}
              </div>
              <div className="min-w-0">
                <Link to={profileHref} className="block font-medium truncate hover:underline">
                  {handle}
                </Link>
                <Link to={raffleHref} className="block text-sm font-medium text-foreground/80 truncate hover:underline">
                  {w.raffle_title ?? 'Ganhável sem nome'}
                </Link>
              </div>
            </div>

            <div className="mt-3 text-sm">
              <div><span className="font-medium">Últimas Dezenas (Federal):</span> {federalFormatted}</div>
              <div><span className="font-medium">Bilhete vencedor:</span> {winningFormatted}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Concurso {w.concurso_number ?? '—'} · {brDate(w.draw_date)}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <span className="text-xs rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">
                Verificado
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}