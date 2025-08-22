import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Home, Trophy, Plus, Gift, Users, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface MyRaffle {
  id: string;
  title: string;
  status: string;
  goal_amount: number;
  created_at: string;
  image_url: string;
  user_id: string;
}

export default function MyLaunchedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<MyRaffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    (async () => {
      setLoading(true);
      
      // Query user's own raffles - NON-NEGOTIABLE SCOPING
      const {
        data, error
      } = await supabase
        .from('raffles')
        .select('id,title,status,goal_amount,created_at,image_url,user_id')
        .eq('user_id', user.id)                  // REQUIRED
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error("[MyLaunched] fetch error", error);
      }
      
      // Dev guard: scream if scope ever breaks
      if (import.meta.env.DEV && data?.some(r => r.user_id !== user.id)) {
        console.error('⚠️ RLS/escopo quebrado: recebido row de outro usuário', data);
      }
      
      if (mounted) {
        const rows = (data || []) as MyRaffle[];
        setRaffles(rows);
        setLoading(false);
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
                    alt={raffle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">{raffle.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Status: {raffle.status}
                    </CardDescription>
                  </div>
                  {getStatusBadge(raffle.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-muted-foreground" />
                      <span>Meta: {formatCurrency(raffle.goal_amount || 0)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Criado: {formatDate(raffle.created_at)}</span>
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