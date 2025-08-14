import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, CreditCard, Trophy, History } from "lucide-react";
import { Link } from "react-router-dom";
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
      
      // For now, just set loading to false and show the dashboard
      // We'll add real data fetching later when the tables exist
      setStats({
        totalTickets: 0,
        totalSpent: 0,
        activeGanhaveis: 0,
        recentTransactions: []
      });
      
      /* TODO: Uncomment when tables exist
      // Fetch user tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id);

      if (ticketsError) throw ticketsError;

      // Fetch user transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactionsError) throw transactionsError;

      // Calculate stats
      const totalTickets = tickets?.length || 0;
      const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const activeGanhaveis = new Set(tickets?.map(t => t.ganhavel_id)).size || 0;

      setStats({
        totalTickets,
        totalSpent: totalSpent / 100, // Convert from cents
        activeGanhaveis,
        recentTransactions: transactions || []
      });
      */
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
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
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
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.user_metadata?.full_name || 'Usuário'}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Meus Tickets
                </CardTitle>
                <CardDescription>
                  Total de tickets comprados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : stats.totalTickets}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.totalTickets === 0 ? "Nenhum ticket comprado" : `${stats.totalTickets} ticket${stats.totalTickets > 1 ? 's' : ''} ativo${stats.totalTickets > 1 ? 's' : ''}`}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Ganhaveis Ativos
                </CardTitle>
                <CardDescription>
                  Ganhaveis que você está participando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{loading ? "..." : stats.activeGanhaveis}</p>
                <p className="text-sm text-muted-foreground">
                  {stats.activeGanhaveis === 0 ? "Nenhum ganhavel ativo" : `Participando de ${stats.activeGanhaveis} ganhavel${stats.activeGanhaveis > 1 ? 'eis' : ''}`}
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
                  {loading ? "..." : `R$ ${stats.totalSpent.toFixed(2)}`}
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
                  <Link to="/descobrir">Explorar Ganhaveis</Link>
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