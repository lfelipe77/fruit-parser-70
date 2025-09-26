import React from 'react';
import { Link } from 'react-router-dom';
import { usePublicWinners, type PublicWinnerCard } from '@/hooks/usePublicWinners';
import { toFiveSingles, formatFiveSingles } from '@/lib/numberFormat';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

function brDate(d?: string | null) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

function WinnerAvatar({ name, handle, src }: { name?: string|null; handle?: string|null; src?: string }) {
  const initials = (name || handle || "GA").trim().slice(0,2).toUpperCase();
  return (
    <Avatar className="h-10 w-10">
      {src ? <AvatarImage src={src} alt={name || handle || "Ganhador"} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

function WinnerTitle({ w }: { w: PublicWinnerCard }) {
  const handle = w.winner_handle ?? "";
  const linkOk = !!handle && !isUuid(handle);
  const displayName = w.winner_name || (linkOk ? handle : "Ganhador Anônimo");
  const href = linkOk ? `/perfil/${encodeURIComponent(handle)}` : undefined;

  return (
    <div className="flex items-center gap-3">
      <WinnerAvatar 
        name={w.winner_name ?? undefined} 
        handle={w.winner_handle ?? undefined} 
        src={w.winner_avatar_url ?? undefined} 
      />
      <div className="flex flex-col min-w-0">
        {href ? (
          <Link to={href} className="font-medium text-foreground truncate hover:underline">
            {displayName}
          </Link>
        ) : (
          <span className="font-medium text-foreground truncate">{displayName}</span>
        )}
        <Link to={`/ganhavel/${w.raffle_id}`} className="text-sm text-muted-foreground truncate hover:underline">
          {w.raffle_title ?? 'Ganhável sem nome'}
        </Link>
      </div>
      {href ? <a className="sr-only" href={href}>Ver perfil</a> : null}
    </div>
  );
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
        Não foi possível carregar ganhadores públicos
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Ainda sem ganhadores públicos.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((w, index) => {
        const federalFormatted = w.federal_target ? formatFiveSingles(toFiveSingles(w.federal_target)) : '—';
        const winningFormatted = w.winning_ticket ? formatFiveSingles(toFiveSingles(w.winning_ticket)) : '—';

        return (
          <div key={w.winner_id || index} className="rounded-2xl border border-border p-4 shadow-sm bg-card">
            <WinnerTitle w={w} />

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