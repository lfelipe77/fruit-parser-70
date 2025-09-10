// src/lib/notificationAdapter.ts
export type DbNotificationType =
  | 'generic'
  | 'raffle_completed'
  | 'raffle_hot'
  | 'ticket_purchased'
  | 'winner_selected';

type UiKind = 'novo_ganhavel' | 'ganhavel_finalizado' | 'sorteio_proximo' | 'compra_confirmada' | 'vencedor_definido' | 'generico';

export function mapTypeToUiKind(t: DbNotificationType): UiKind {
  switch (t) {
    case 'ticket_purchased': return 'compra_confirmada';
    case 'raffle_completed': return 'ganhavel_finalizado';
    case 'raffle_hot':       return 'sorteio_proximo';
    case 'winner_selected':  return 'vencedor_definido';
    case 'generic':
    default:                 return 'generico';
  }
}

export function uiKindToLabel(kind: UiKind): string {
  switch (kind) {
    case 'compra_confirmada':   return 'Compra confirmada';
    case 'ganhavel_finalizado': return 'Ganhavel finalizado';
    case 'sorteio_proximo':     return 'Sorteio do Ganhavel em breve';
    case 'vencedor_definido':   return 'Vencedor definido';
    case 'novo_ganhavel':       return 'Novo Ganhavel';
    default:                    return 'Notificação';
  }
}