import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  user_id: string;
  type: 'nova_rifa' | 'rifa_finalizada' | 'sorteio_proximo' | 'organizador_seguido' | 'ticket_purchased' | 'winner_selected';
  title: string;
  message: string;
  data?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const { data, error } = await supabase.functions.invoke('create-notification', {
      body: params
    });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log('Notification created:', data);
    return data;
  } catch (error) {
    console.error('Failed to create notification:', error);
    throw error;
  }
}

// Helper functions for common notification types
export const NotificationHelpers = {
  async newRaffleCreated(raffleId: string, creatorName: string, raffleTitle: string, followerIds: string[]) {
    const notifications = followerIds.map(userId => ({
      user_id: userId,
      type: 'nova_rifa' as const,
      title: 'Novo Ganhavel Lançado!',
      message: `${creatorName} lançou um novo ganhavel: ${raffleTitle}`,
      data: { raffle_id: raffleId, creator_name: creatorName }
    }));

    return Promise.allSettled(
      notifications.map(notification => createNotification(notification))
    );
  },

  async ticketPurchased(userId: string, raffleTitle: string, ticketCount: number, raffleId: string) {
    return createNotification({
      user_id: userId,
      type: 'ticket_purchased',
      title: 'Compra Confirmada!',
      message: `Você comprou ${ticketCount} ${ticketCount === 1 ? 'bilhete' : 'bilhetes'} para "${raffleTitle}"`,
      data: { raffle_id: raffleId, ticket_count: ticketCount }
    });
  },

  async raffleCompleted(creatorId: string, raffleTitle: string, raffleId: string) {
    return createNotification({
      user_id: creatorId,
      type: 'rifa_finalizada',
      title: 'Ganhavel Finalizado',
      message: `Seu ganhavel "${raffleTitle}" foi concluído com sucesso!`,
      data: { raffle_id: raffleId }
    });
  },

  async winnerSelected(winnerId: string, raffleTitle: string, raffleId: string, prize: string) {
    return createNotification({
      user_id: winnerId,
      type: 'winner_selected',
      title: '🎉 Você Ganhou!',
      message: `Parabéns! Você ganhou "${raffleTitle}" - ${prize}`,
      data: { raffle_id: raffleId, prize }
    });
  },

  async drawingSoon(participantIds: string[], raffleTitle: string, raffleId: string, hoursUntilDraw: number) {
    const notifications = participantIds.map(userId => ({
      user_id: userId,
      type: 'sorteio_proximo' as const,
      title: 'Sorteio em Breve',
      message: `O ganhavel "${raffleTitle}" será sorteado em ${hoursUntilDraw} horas`,
      data: { raffle_id: raffleId, hours_until_draw: hoursUntilDraw }
    }));

    return Promise.allSettled(
      notifications.map(notification => createNotification(notification))
    );
  }
};