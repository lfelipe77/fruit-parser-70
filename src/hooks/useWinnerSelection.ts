import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWinnerSelection = () => {
  const [isSelecting, setIsSelecting] = useState(false);

  const selectWinner = async (raffleId: string) => {
    setIsSelecting(true);
    try {
      // For now, this is a placeholder function
      // In the future, this will integrate with lottery APIs and proper random selection
      
      // Get all paid tickets for this raffle
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('id, user_id, ticket_number')
        .eq('raffle_id', raffleId)
        .eq('is_paid', true);

      if (ticketsError) throw ticketsError;
      if (!tickets || tickets.length === 0) {
        throw new Error('No tickets found for this raffle');
      }

      // Simple random selection (placeholder - will be replaced with lottery integration)
      const randomIndex = Math.floor(Math.random() * tickets.length);
      const winningTicket = tickets[randomIndex];

      // Update raffle with winner - use 'premiado' status to indicate winner selected
      const { error: updateError } = await supabase
        .from('raffles')
        .update({
          status: 'premiado',
          winner_user_id: winningTicket.user_id,
          draw_timestamp: new Date().toISOString(),
          closed_at: new Date().toISOString()
        })
        .eq('id', raffleId);

      if (updateError) throw updateError;

      // Create lottery result record
      const { error: resultError } = await supabase
        .from('lottery_results')
        .insert({
          ganhavel_id: raffleId,
          winning_ticket_id: winningTicket.id,
          lottery_draw_numbers: String(winningTicket.ticket_number),
          result_date: new Date().toISOString(),
          verified: false // Will be updated when integrated with actual lottery
        });

      if (resultError) {
        console.error('Error creating lottery result:', resultError);
      }

      toast.success(`Ganhador selecionado! Bilhete #${winningTicket.ticket_number}`);
      
      return {
        success: true,
        winningTicket,
        drawNumber: winningTicket.ticket_number
      };

    } catch (error: any) {
      console.error('Winner selection error:', error);
      toast.error(error.message || 'Erro ao selecionar ganhador');
      return { success: false };
    } finally {
      setIsSelecting(false);
    }
  };

  const getRaffleStatus = (raffle: any) => {
    if (!raffle) return 'unknown';
    
    if (raffle.status === 'premiado') return 'premiado';
    if (raffle.status === 'completed') return 'completed';
    if (raffle.progress_pct >= 100) return 'ready_for_draw';
    if (raffle.status === 'active') return 'active';
    if (raffle.status === 'pending') return 'pending';
    
    return 'other';
  };

  return {
    selectWinner,
    isSelecting,
    getRaffleStatus
  };
};