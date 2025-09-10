import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from './useIsAdmin';

export interface AnalyticsOverview {
  totalUsers: number;
  totalRaffles: number;
  totalRevenue: number;
  activeRaffles: number;
  monthlyGrowth: {
    users: number;
    raffles: number;
    revenue: number;
  };
}

export interface CategoryPerformance {
  id: number;
  name: string;
  rafflesCount: number;
  revenue: number;
  growth: number;
}

export interface TopOrganizer {
  id: string;
  name: string;
  rafflesCount: number;
  totalRevenue: number;
  displayName: string;
}

export interface WeeklyTrend {
  metric: string;
  thisWeek: number;
  lastWeek: number;
  change: number;
}

export interface GeographyData {
  state: string;
  rafflesCount: number;
  revenue: number;
  usersCount: number;
}

export function useAdminAnalytics() {
  const { isAdmin } = useIsAdmin();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [categories, setCategories] = useState<CategoryPerformance[]>([]);
  const [organizers, setOrganizers] = useState<TopOrganizer[]>([]);
  const [trends, setTrends] = useState<WeeklyTrend[]>([]);
  const [geography, setGeography] = useState<GeographyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    fetchAnalyticsData();
  }, [isAdmin]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewData, categoriesData, organizersData, trendsData, geoData] = await Promise.all([
        fetchOverview(),
        fetchCategories(),
        fetchOrganizers(),
        fetchTrends(),
        fetchGeography()
      ]);

      setOverview(overviewData);
      setCategories(categoriesData);
      setOrganizers(organizersData);
      setTrends(trendsData);
      setGeography(geoData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async (): Promise<AnalyticsOverview> => {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get total and active raffles
    const { count: totalRaffles } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true });

    const { count: activeRaffles } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get total revenue from paid transactions
    const { data: revenueData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    // Calculate monthly growth
    const currentMonth = new Date();
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const thisMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    // Users growth
    const { count: thisMonthUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart.toISOString());

    const { count: lastMonthUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonthStart.toISOString());

    // Raffles growth
    const { count: thisMonthRaffles } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisMonthStart.toISOString());

    const { count: lastMonthRafflesCount } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonthStart.toISOString());

    // Revenue growth
    const { data: thisMonthRevenue } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', thisMonthStart.toISOString());

    const { data: lastMonthRevenue } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', thisMonthStart.toISOString());

    const thisMonthRevenueTotal = thisMonthRevenue?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
    const lastMonthRevenueTotal = lastMonthRevenue?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    return {
      totalUsers: totalUsers || 0,
      totalRaffles: totalRaffles || 0,
      totalRevenue,
      activeRaffles: activeRaffles || 0,
      monthlyGrowth: {
        users: lastMonthUsers ? Math.round(((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100) : 0,
        raffles: lastMonthRafflesCount ? Math.round(((thisMonthRaffles || 0) - lastMonthRafflesCount) / lastMonthRafflesCount * 100) : 0,
        revenue: lastMonthRevenueTotal ? Math.round((thisMonthRevenueTotal - lastMonthRevenueTotal) / lastMonthRevenueTotal * 100) : 0,
      }
    };
  };

  const fetchCategories = async (): Promise<CategoryPerformance[]> => {
    // Get categories with raffle counts and revenue
    const { data: categoriesData } = await supabase
      .from('categories')
      .select(`
        id,
        nome,
        raffles!inner (
          id,
          transactions!inner (
            amount,
            status
          )
        )
      `);

    if (!categoriesData) return [];

    const categoryPerformance = categoriesData.map(category => {
      const rafflesCount = category.raffles?.length || 0;
      const revenue = category.raffles?.reduce((sum, raffle) => {
        return sum + (raffle.transactions?.filter((tx: any) => tx.status === 'paid')
          .reduce((txSum: number, tx: any) => txSum + (tx.amount || 0), 0) || 0);
      }, 0) || 0;

      return {
        id: category.id,
        name: category.nome,
        rafflesCount,
        revenue,
        growth: Math.floor(Math.random() * 30) + 5 // Mock growth for now
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    return categoryPerformance;
  };

  const fetchOrganizers = async (): Promise<TopOrganizer[]> => {
    // Get organizers with transaction data
    const { data: organizersData } = await supabase
      .from('raffles')
      .select(`
        id,
        owner_user_id,
        transactions!inner (
          amount,
          status
        )
      `)
      .not('owner_user_id', 'is', null);

    if (!organizersData) return [];

    // Get unique organizer IDs
    const organizerIds = [...new Set(organizersData.map(raffle => raffle.owner_user_id))];

    // Fetch organizer profiles separately
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id, full_name, display_name')
      .in('id', organizerIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Group by organizer and calculate metrics
    const organizerMap = new Map();

    organizersData.forEach(raffle => {
      const userId = raffle.owner_user_id;
      const profile = profileMap.get(userId);
      
      if (!organizerMap.has(userId)) {
        organizerMap.set(userId, {
          id: userId,
          name: profile?.full_name || profile?.display_name || 'Organizador',
          displayName: profile?.display_name || profile?.full_name || 'Organizador',
          rafflesCount: 0,
          totalRevenue: 0
        });
      }

      const organizer = organizerMap.get(userId);
      organizer.rafflesCount += 1;
      
      const revenue = raffle.transactions
        ?.filter((tx: any) => tx.status === 'paid')
        .reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 0;
      
      organizer.totalRevenue += revenue;
    });

    return Array.from(organizerMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 6);
  };

  const fetchTrends = async (): Promise<WeeklyTrend[]> => {
    const now = new Date();
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);

    // This week raffles
    const { count: thisWeekRaffles } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisWeekStart.toISOString());

    // Last week raffles
    const { count: lastWeekRaffles } = await supabase
      .from('raffles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString());

    // This week users
    const { count: thisWeekUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thisWeekStart.toISOString());

    // Last week users
    const { count: lastWeekUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString());

    // This week revenue
    const { data: thisWeekRevenue } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', thisWeekStart.toISOString());

    // Last week revenue
    const { data: lastWeekRevenue } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'paid')
      .gte('created_at', lastWeekStart.toISOString())
      .lte('created_at', lastWeekEnd.toISOString());

    const thisWeekRevenueTotal = thisWeekRevenue?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;
    const lastWeekRevenueTotal = lastWeekRevenue?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return [
      {
        metric: 'Ganhaveis Criados',
        thisWeek: thisWeekRaffles || 0,
        lastWeek: lastWeekRaffles || 0,
        change: calculateChange(thisWeekRaffles || 0, lastWeekRaffles || 0)
      },
      {
        metric: 'Novos Usuários',
        thisWeek: thisWeekUsers || 0,
        lastWeek: lastWeekUsers || 0,
        change: calculateChange(thisWeekUsers || 0, lastWeekUsers || 0)
      },
      {
        metric: 'Receita',
        thisWeek: thisWeekRevenueTotal,
        lastWeek: lastWeekRevenueTotal,
        change: calculateChange(thisWeekRevenueTotal, lastWeekRevenueTotal)
      }
    ];
  };

  const fetchGeography = async (): Promise<GeographyData[]> => {
    // Get raffles by state with revenue
    const { data: geoData } = await supabase
      .from('raffles')
      .select(`
        location_state,
        transactions!inner (
          amount,
          status,
          user_id
        )
      `)
      .not('location_state', 'is', null);

    if (!geoData) return [];

    const stateMap = new Map();

    geoData.forEach(raffle => {
      const state = raffle.location_state;
      if (!state) return;

      if (!stateMap.has(state)) {
        stateMap.set(state, {
          state,
          rafflesCount: 0,
          revenue: 0,
          userIds: new Set()
        });
      }

      const stateData = stateMap.get(state);
      stateData.rafflesCount += 1;

      const revenue = raffle.transactions
        ?.filter((tx: any) => tx.status === 'paid')
        .reduce((sum: number, tx: any) => {
          if (tx.user_id) stateData.userIds.add(tx.user_id);
          return sum + (tx.amount || 0);
        }, 0) || 0;

      stateData.revenue += revenue;
    });

    return Array.from(stateMap.values())
      .map(state => ({
        state: state.state,
        rafflesCount: state.rafflesCount,
        revenue: state.revenue,
        usersCount: state.userIds.size
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  return {
    overview,
    categories,
    organizers,
    trends,
    geography,
    loading,
    error,
    refreshData: fetchAnalyticsData
  };
}