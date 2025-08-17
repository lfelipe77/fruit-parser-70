import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

      // Performant count queries using HEAD requests
      
      // Count tickets purchased by user
      const { count: ticketsCount, error: ticketsError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);

      if (ticketsError) {
        console.error('Error counting tickets:', ticketsError);
      }

      // Count active raffles launched by user  
      const { count: activeLaunchedCount, error: rafflesError } = await supabase
        .from('raffles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid)
        .eq('status', 'active');

      if (rafflesError) {
        console.error('Error counting active raffles:', rafflesError);
      }

      // Get recent transactions for spending calculation
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, status, created_at, id')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      }

      // Calculate total spent from completed transactions
      const totalSpent = transactions
        ?.filter(t => t.status === 'completed' || t.status === 'paid')
        ?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        totalTickets: ticketsCount ?? 0,
        totalSpent: totalSpent,
        activeGanhaveis: activeLaunchedCount ?? 0,
        recentTransactions: transactions?.slice(0, 5) || []
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
                   <Avatar className="w-16 h-16">
                     <AvatarImage src={profile?.avatar_url || ''} />
                     <AvatarFallback>
                       {user.email?.charAt(0).toUpperCase()}
                     </AvatarFallback>
                   </Avatar>
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
              onClick={() => navigate('/raffles')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Ganhaveis que você lançou
                </CardTitle>
                <CardDescription>
                  Ganhaveis aprovados (ativos) que você lançou
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : stats.activeGanhaveis}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.activeGanhaveis === 0 ? "Nenhum ganhavel lançado" : `${stats.activeGanhaveis} ganhavel${stats.activeGanhaveis > 1 ? 'eis' : ''} ativo${stats.activeGanhaveis > 1 ? 's' : ''}`}
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
                    {stats.recentTransactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-border/50">
                        <div>
                          <p className="text-sm font-medium">
                            Pagamento #{transaction.id.slice(0, 8)}
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
                            transaction.status === 'completed' ? 'text-green-600' : 
                            transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {transaction.status === 'completed' ? 'Pago' : 
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