import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/UserAvatar";
import { useMyProfile } from "@/hooks/useMyProfile";
import { LogOut, User, CreditCard, Trophy, History } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DebugDashboardPanel from '@/components/DebugDashboardPanel';
interface DashboardStats {
  totalTickets: number;
  totalSpent: number;
  activeGanhaveis: number;
  recentTransactions: any[];
}

export default function Dashboard() {
  console.log('[dash] mounted');
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useMyProfile();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    totalSpent: 0,
    activeGanhaveis: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[dash] user state:', { user: !!user, authLoading });
    if (user && !authLoading) {
      fetchDashboardData();
    }

    // Real-time updates for dashboard
    const onUpdated = () => {
      if (user && !authLoading) {
        fetchDashboardData();
      }
    };
    window.addEventListener("raffleUpdated", onUpdated);
    const interval = setInterval(() => {
      if (user && !authLoading) {
        fetchDashboardData();
      }
    }, 60000); // Refresh every minute

    return () => {
      window.removeEventListener("raffleUpdated", onUpdated);
      clearInterval(interval);
    };
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      console.log('[dash] fetching data for user:', user?.id);
      
      const uid = user?.id;
      if (!uid) {
        setStats({
          totalTickets: 0,
          totalSpent: 0,
          activeGanhaveis: 0,
          recentTransactions: []
        });
        return;
      }

      // Parallel queries for better performance
      const [ticketsResult, rafflesResult, transactionsResult] = await Promise.all([
        // Get all paid transactions with their ticket counts to calculate total tickets
        supabase
          .from('transactions')
          .select('id, numbers, status')
          .eq('buyer_user_id', uid)
          .eq('status', 'paid'),

        // Count active raffles created by user  
        supabase
          .from('raffles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', uid)
          .eq('status', 'active'),

        // Get recent transactions with raffle details
        supabase
          .from('transactions')
          .select(`
            id,
            amount,
            status,
            created_at,
            raffle_id,
            raffles!inner(title)
          `)
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Handle results and errors
      if (ticketsResult.error) {
        console.error('Error fetching tickets:', ticketsResult.error);
      }

      if (rafflesResult.error) {
        console.error('Error counting active raffles:', rafflesResult.error);
      }

      if (transactionsResult.error) {
        console.error('Error fetching transactions:', transactionsResult.error);
      }

      // Calculate total tickets from transaction numbers (each array element represents one ticket)
      const totalTickets = (ticketsResult.data || [])
        .reduce((sum, transaction) => {
          const numbers = transaction.numbers;
          if (Array.isArray(numbers)) {
            return sum + numbers.length;
          }
          return sum;
        }, 0);

      // Calculate total spent from paid transactions
      const transactions = transactionsResult.data || [];
      const totalSpent = transactions
        .filter(t => ['completed', 'paid', 'approved', 'succeeded'].includes(t.status))
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      setStats({
        totalTickets: totalTickets,
        totalSpent: totalSpent,
        activeGanhaveis: rafflesResult.count ?? 0,
        recentTransactions: transactions.slice(0, 5).map(t => ({
          ...t,
          raffle_title: t.raffles?.title || 'Rifa removida'
        }))
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    console.log('[dash] showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // RequireAuth should handle this, but just in case
  if (!user) {
    console.log('[dash] no user, should not happen with RequireAuth');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  console.log('[dash] rendering dashboard for user:', user.email);

  return (
    <>
      <DebugDashboardPanel />
      <div className="p-6">
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">G</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Ganhavel</h1>
                    <p className="text-sm text-muted-foreground">Sua plataforma de ganhaveis</p>
                  </div>
                </Link>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              role="button"
              onClick={() => navigate('/profile')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil do Usuário
                </CardTitle>
                <CardDescription>
                  Informações da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center gap-4">
                    <UserAvatar
                      avatarUrl={profile?.avatar_url}
                      updatedAt={profile?.updated_at}
                      alt={profile?.full_name || profile?.username || 'user'}
                      size="lg"
                      fallbackText={profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    />
                   <div>
                     <p className="font-medium">
                       {profile?.full_name || user.user_metadata?.full_name || 'Usuário'}
                     </p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {user.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              role="button"
              onClick={() => navigate('/my-tickets')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Meus Bilhetes
                </CardTitle>
                <CardDescription>
                  Total de Bilhetes comprados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : stats.totalTickets}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalTickets === 0 ? "Nenhum bilhete comprado" : `${stats.totalTickets} bilhete${stats.totalTickets > 1 ? 's' : ''} comprado${stats.totalTickets > 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              role="button"
              onClick={() => navigate('/my-launched')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Ganháveis que você lançou
                </CardTitle>
                <CardDescription>
                  Ganháveis aprovados (ativos) que você lançou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : stats.activeGanhaveis}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.activeGanhaveis === 0 ? "Nenhum ganhavel lançado" : `${stats.activeGanhaveis} ganhavel${stats.activeGanhaveis > 1 ? 'eis' : ''} ativo${stats.activeGanhaveis > 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              role="button"
              onClick={() => navigate('/my-tickets?filter=won')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Ganháveis que Ganhei
                </CardTitle>
                <CardDescription>
                  Ganháveis em que você foi sorteado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">
                  Nenhuma vitória ainda
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Investido</CardTitle>
                <CardDescription>
                  Valor total gasto em participações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {loading ? "..." : `R$ ${(stats.totalSpent / 100).toFixed(2)}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalSpent === 0 ? "Nenhum gasto registrado" : "Valor acumulado"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo ao Ganhavel!</CardTitle>
                <CardDescription>
                  Sua jornada para ganhar prêmios incríveis começa aqui
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Explore os ganhaveis disponíveis e comece a participar para ter a chance de ganhar 
                  carros, motos, dinheiro e muito mais!
                </p>
                <Button asChild>
                  <Link to="/raffles">Explorar Ganhaveis</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Histórico Recente
                </CardTitle>
                <CardDescription>
                  Suas últimas transações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : stats.recentTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma transação encontrada
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.recentTransactions.slice(0, 3).map((transaction: any) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-border/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {transaction.raffle_title || `Pagamento #${transaction.id.slice(0, 8)}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            R$ {((transaction.amount || 0) / 100).toFixed(2)}
                          </p>
                          <p className={`text-xs ${
                            ['completed', 'paid', 'approved', 'succeeded'].includes(transaction.status) ? 'text-green-600' : 
                            transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {['completed', 'paid', 'approved', 'succeeded'].includes(transaction.status) ? 'Pago' : 
                             transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}