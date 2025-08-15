import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, TrendingUp, Clock, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface ParticipatingRaffle {
  raffle_id: string;
  my_tickets_count: number;
  total_spent: number;
  raffle: {
    id: string;
    title: string;
    product_name: string;
    product_value: number;
    ticket_price: number;
    total_tickets: number;
    image_url: string;
    status: string;
    draw_date: string;
    created_at: string;
  };
}

export default function MyParticipatingRaffles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [participatingRaffles, setParticipatingRaffles] = useState<ParticipatingRaffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipatingRaffles = async () => {
      if (!user) return;

      try {
        // Get raffles where user has tickets
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            raffle_id,
            total_amount,
            raffles!inner (
              id,
              title,
              product_name,
              product_value,
              ticket_price,
              total_tickets,
              image_url,
              status,
              draw_date,
              created_at
            )
          `)
          .eq('user_id', user.id)
          .eq('payment_status', 'paid')
          .in('raffles.status', ['active', 'scheduled', 'closed']);

        if (error) throw error;

        // Group by raffle and aggregate ticket counts
        const raffleMap = new Map<string, ParticipatingRaffle>();
        
        data?.forEach((ticket) => {
          if (!ticket.raffles) return;
          
          const raffleId = ticket.raffle_id;
          if (raffleMap.has(raffleId)) {
            const existing = raffleMap.get(raffleId)!;
            existing.my_tickets_count += 1;
            existing.total_spent += ticket.total_amount || 0;
          } else {
            raffleMap.set(raffleId, {
              raffle_id: raffleId,
              my_tickets_count: 1,
              total_spent: ticket.total_amount || 0,
              raffle: ticket.raffles as any
            });
          }
        });

        let participatingData = Array.from(raffleMap.values());

        // Add mock data in development if no real data exists
        if (process.env.NODE_ENV === 'development' && participatingData.length === 0) {
          const mockParticipating: ParticipatingRaffle[] = [{
            raffle_id: 'mock-raffle-1',
            my_tickets_count: 3,
            total_spent: 3000, // R$ 30.00 in cents
            raffle: {
              id: 'mock-raffle-1',
              title: 'Carro 0km Honda Civic 2024',
              product_name: 'Honda Civic',
              product_value: 8000000, // R$ 80.000,00 in cents
              ticket_price: 1000,
              total_tickets: 5000,
              image_url: '/lovable-uploads/4f6691ae-418c-477c-9958-16166ad9f887.png',
              status: 'active',
              draw_date: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
              created_at: new Date(Date.now() - 30 * 86400000).toISOString()
            }
          }, {
            raffle_id: 'mock-raffle-2',
            my_tickets_count: 1,
            total_spent: 500,
            raffle: {
              id: 'mock-raffle-2',
              title: 'iPhone 15 Pro Max 256GB',
              product_name: 'iPhone 15 Pro Max',
              product_value: 800000, // R$ 8.000,00 in cents
              ticket_price: 500,
              total_tickets: 2000,
              image_url: '/lovable-uploads/67eff453-d5b1-47f9-a141-e80286a38ba0.png',
              status: 'active',
              draw_date: new Date(Date.now() + 14 * 86400000).toISOString(),
              created_at: new Date(Date.now() - 15 * 86400000).toISOString()
            }
          }];
          participatingData = mockParticipating;
        }

        setParticipatingRaffles(participatingData);
      } catch (error) {
        console.error('Error fetching participating raffles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipatingRaffles();
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
      case 'scheduled':
        return <Badge variant="secondary">Agendado</Badge>;
      case 'closed':
        return <Badge variant="outline">Encerrado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ganhaveis Ativos</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (participatingRaffles.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ganhaveis Ativos</h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Você não está participando de nenhum ganhavel</h3>
            <p className="text-muted-foreground text-center mb-6">
              Explore os ganhaveis disponíveis e compre seus tickets para começar a participar!
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/raffles">
                  <Search className="w-4 h-4 mr-2" />
                  Explorar Ganhaveis
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ganhaveis Ativos</h1>
          <p className="text-muted-foreground">
            Ganhaveis que você está participando ({participatingRaffles.length})
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button asChild>
            <Link to="/raffles">
              <Search className="w-4 h-4 mr-2" />
              Explorar Mais
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participatingRaffles.map((item) => (
          <Card key={item.raffle_id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {item.raffle.image_url && (
              <div className="aspect-video overflow-hidden">
                <img
                  src={item.raffle.image_url}
                  alt={item.raffle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2">{item.raffle.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {item.raffle.product_name}
                  </CardDescription>
                </div>
                {getStatusBadge(item.raffle.status)}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Seus tickets:</span>
                    <span className="font-semibold">{item.my_tickets_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Investido:</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(item.total_spent)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">
                      Prêmio: {formatCurrency(item.raffle.product_value || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span>{item.raffle.total_tickets} tickets</span>
                  </div>
                  
                  {item.raffle.draw_date && (
                    <div className="flex items-center gap-2 col-span-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Sorteio: {formatDate(item.raffle.draw_date)}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <Button className="w-full" asChild>
                    <Link to={`/raffles/${item.raffle_id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}