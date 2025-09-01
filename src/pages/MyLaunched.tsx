import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Trophy, Plus, Gift, Users, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

type RaffleWithProgress = {
  id: string;
  title: string | null;
  status: string | null;
  goal_amount: number | null;
  image_url: string | null;
  created_at: string;
  user_id: string;                 // present in the view
  amount_raised: number | null;    // from view
  progress_pct_money: number | null; // from view
};

async function fetchMyLaunched(userId: string) {
  const { data, error } = await supabase
    .from('raffles')
    .select(`
      id,
      title,
      status,
      goal_amount,
      image_url,
      created_at,
      user_id,
      raffles_public_money_ext!inner(amount_raised, progress_pct_money)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  
  return (data ?? []).map(item => ({
    ...item,
    amount_raised: item.raffles_public_money_ext?.[0]?.amount_raised || 0,
    progress_pct_money: item.raffles_public_money_ext?.[0]?.progress_pct_money || 0
  })) as RaffleWithProgress[];
}

export default function MyLaunchedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<RaffleWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    (async () => {
      setLoading(true);
      
      try {
        const data = await fetchMyLaunched(user.id);
        if (mounted) {
          setRaffles(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("[MyLaunched] fetch error", error);
        if (mounted) {
          setRaffles([]);
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  function ProgressBar({ value }: { value?: number | null }) {
    const pct = Math.max(0, Math.min(Number(value ?? 0), 100));
    return (
      <div className="w-full bg-gray-200/70 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-emerald-500"
          style={{ width: `${pct}%` }}
          data-testid="raffle-progress"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'completed':
        return <Badge variant="secondary">Finalizado</Badge>;
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6">
        <div className="text-center text-gray-600 py-16">
          Faça login para ver seus ganhaveis.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Ganháveis que Lancei</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Início
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/lance-seu-ganhavel" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (raffles.length === 0 || !raffles) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Gift className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum ganhável lançado ainda</h3>
            <p className="text-muted-foreground text-center mb-6">
              Você ainda não lançou nenhum ganhável. Comece agora e crie sua primeira campanha!
            </p>
            <Button asChild>
              <Link to="/lance-seu-ganhavel" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Lançar Meu Primeiro Ganhável
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!loading && raffles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map((raffle) => (
            <Card key={raffle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {raffle.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={raffle.image_url}
                    alt={raffle.title || 'Raffle image'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{raffle.title || 'Untitled'}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Status: {raffle.status || 'Unknown'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(raffle.status || 'unknown')}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-muted-foreground" />
                      <span>Meta: {formatCurrency(raffle.goal_amount || 0)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Criado: {formatDate(raffle.created_at)}</span>
                    </div>

                    {/* Progress section */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Arrecadado: {formatCurrency(raffle.amount_raised || 0)}</span>
                        <span className="font-medium tabular-nums" data-testid={`progress-pct-${raffle.id}`}>
                          {(raffle.progress_pct_money ?? 0)}%
                        </span>
                      </div>
                      <ProgressBar value={raffle.progress_pct_money} />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link to={`/ganhavel/${raffle.id}`}>
                          Ver Ganhável
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/gerenciar-ganhavel/${raffle.id}`}>
                          Gerenciar
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}