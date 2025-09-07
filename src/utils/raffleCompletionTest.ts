import { supabase } from '@/integrations/supabase/client';

/**
 * Debug utility to test raffle completion detection
 * This can be called from browser console to manually check a raffle
 */
export async function testRaffleCompletion(raffleId?: string) {
  try {
    // If no raffleId provided, check for "Teste de Função"
    if (!raffleId) {
      const { data: testRaffle } = await supabase
        .from('raffles_public_money_ext')
        .select('id, title, progress_pct_money, status')
        .ilike('title', '%teste%função%')
        .single();
      
      if (testRaffle) {
        raffleId = testRaffle.id;
        console.log('Found "Teste de Função" raffle:', testRaffle);
      } else {
        console.log('No "Teste de Função" raffle found');
        return;
      }
    }

    // Check the raffle status
    const { data, error } = await supabase
      .from('raffles_public_money_ext')
      .select('id, title, status, progress_pct_money, amount_raised, goal_amount, participants_count')
      .eq('id', raffleId)
      .single();

    if (error) {
      console.error('Error fetching raffle:', error);
      return;
    }

    console.log('=== RAFFLE COMPLETION TEST ===');
    console.log('Raffle:', data);
    console.log('Progress:', `${data.progress_pct_money}%`);
    console.log('Status:', data.status);
    console.log('Amount:', `${data.amount_raised} / ${data.goal_amount}`);
    console.log('Participants:', data.participants_count);

    // Check if it should be considered complete
    const isComplete = data.progress_pct_money >= 100;
    const needsStatusUpdate = isComplete && data.status === 'active';

    console.log('Should be complete?', isComplete);
    console.log('Needs status update?', needsStatusUpdate);

    if (needsStatusUpdate) {
      console.log('🎉 This raffle should trigger completion!');
      
      // Dispatch completion event manually for testing
      window.dispatchEvent(new CustomEvent('raffleCompleted', {
        detail: {
          raffleId,
          data,
          progress: data.progress_pct_money
        }
      }));
      
      console.log('Dispatched raffleCompleted event for testing');
    }

    return data;
  } catch (error) {
    console.error('Error in testRaffleCompletion:', error);
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testRaffleCompletion = testRaffleCompletion;
}