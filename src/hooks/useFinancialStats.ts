import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from './useIsAdmin';

export interface FinancialStats {
  totalRevenue: number;
  totalCommissions: number;
  pendingPayments: number;
  completedPayments: number;
  totalRefunds: number;
  monthlyGrowth: number;
  disputeRate: number;
  activeRaffles: number;
  totalTransactions: number;
}

export interface FinancialTransaction {
  id: string;
  raffle_id: string;
  raffle_title: string;
  organizer_name: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  status: string;
  payment_method: string;
  transaction_date: string;
  type: string;
  description: string;
  // Buyer contact info
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_cpf?: string | null;
}

export function useFinancialStats() {
  const { isAdmin } = useIsAdmin();
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchFinancialData();
  }, [isAdmin]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch financial stats
      const statsPromise = fetchStats();
      const transactionsPromise = fetchTransactions();

      const [statsData, transactionsData] = await Promise.all([statsPromise, transactionsPromise]);

      setStats(statsData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error fetching financial data:', err);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (): Promise<FinancialStats> => {
    // Get transactions stats
    const { data: transactionStats } = await supabase
      .from('transactions')
      .select(`
        status,
        amount,
        created_at,
        raffle_id
      `)
      .eq('status', 'paid');

    // Get current month transactions for growth calculation
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const { data: thisMonthTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', thisMonthStart.toISOString());

    const { data: lastMonthTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonthStart.toISOString());

    // Get active raffles count
    const { count: activeRaffles } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Calculate stats
    const totalRevenue = transactionStats?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
    const totalCommissions = totalRevenue * 0.1; // 10% commission
    const thisMonthRevenue = thisMonthTx?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
    const lastMonthRevenue = lastMonthTx?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
    
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      totalCommissions,
      pendingPayments: 0, // We'll calculate this from pending payouts
      completedPayments: totalRevenue,
      totalRefunds: 0, // We'll need to track refunds separately
      monthlyGrowth,
      disputeRate: 0, // We'll need to implement dispute tracking
      activeRaffles: activeRaffles || 0,
      totalTransactions: transactionStats?.length || 0
    };
  };

const fetchTransactions = async (): Promise<FinancialTransaction[]> => {
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      id,
      raffle_id,
      amount,
      status,
      created_at,
      provider,
      customer_name,
      customer_email,
      customer_phone,
      customer_cpf,
      raffles!inner (
        title,
        owner_user_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

    if (!transactions) return [];

    // Get organizer details separately to avoid relationship ambiguity
    const raffleIds = transactions.map(tx => tx.raffle_id);
    const { data: raffleDetails } = await supabase
      .from('raffles')
      .select(`
        id,
        title,
        owner_user_id,
        user_profiles!raffles_owner_user_id_fkey (
          full_name,
          display_name
        )
      `)
      .in('id', raffleIds);

    return transactions.map(tx => {
      const raffleDetail = raffleDetails?.find(r => r.id === tx.raffle_id);
      const organizerName = raffleDetail?.user_profiles?.full_name || 
                           raffleDetail?.user_profiles?.display_name || 
                           'Organizador';

      return {
        id: tx.id,
        raffle_id: tx.raffle_id,
        raffle_title: tx.raffles.title || 'Rifa sem título',
        organizer_name: organizerName,
        amount: tx.amount || 0,
        fee_amount: 2.00, // taxa fixa por transação
        net_amount: Math.max(0, (tx.amount || 0) - 2.00), // líquido = bruto - taxa fixa
        status: tx.status || 'pending',
        payment_method: tx.provider || 'unknown',
        transaction_date: tx.created_at,
        type: tx.status === 'paid' ? 'payment_release' : 'pending_payment',
        description: `Transação - ${tx.raffles.title}`,
        customer_name: tx.customer_name ?? null,
        customer_email: tx.customer_email ?? null,
        customer_phone: tx.customer_phone ?? null,
        customer_cpf: tx.customer_cpf ?? null,
      };
    });
  };

  return {
    stats,
    transactions,
    loading,
    error,
    refreshData: fetchFinancialData
  };
}