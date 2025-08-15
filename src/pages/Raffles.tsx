import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Users, Clock, ArrowLeft, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface Raffle {
  id: string;
  title: string;
  description: string;
  product_name: string;
  product_value: number;
  total_tickets: number;
  ticket_price: number;
  image_url: string;
  status: string;
  created_at: string;
}

export default function Raffles() {
  const navigate = useNavigate();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        const { data, error } = await supabase
          .from('raffles')
          .select('id, title, description, product_name, product_value, total_tickets, ticket_price, image_url, status, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        let rafflesData = data || [];

        // Add mock data in development if no real data exists
        if (process.env.NODE_ENV === 'development' && rafflesData.length === 0) {
          const mockRaffles: Raffle[] = [{
            id: 'mock-raffle-1',
            title: 'Carro 0km Honda Civic 2024',
            description: 'Um Honda Civic 2024 novinho em folha, com todos os opcionais.',
            product_name: 'Honda Civic',
            product_value: 8000000, // R$ 80.000,00 in cents
            total_tickets: 5000,
            ticket_price: 1000, // R$ 10,00 in cents
            image_url: '/lovable-uploads/4f6691ae-418c-477c-9958-16166ad9f887.png',
            status: 'active',
            created_at: new Date(Date.now() - 30 * 86400000).toISOString() // 30 days ago
          }, {
            id: 'mock-raffle-2',
            title: 'iPhone 15 Pro Max 256GB',
            description: 'O mais novo iPhone com toda tecnologia Apple.',
            product_name: 'iPhone 15 Pro Max',
            product_value: 800000, // R$ 8.000,00 in cents
            total_tickets: 2000,
            ticket_price: 500,
            image_url: '/lovable-uploads/67eff453-d5b1-47f9-a141-e80286a38ba0.png',
            status: 'active',
            created_at: new Date(Date.now() - 15 * 86400000).toISOString()
          }, {
            id: 'mock-raffle-3',
            title: 'R$ 50.000 em Dinheiro',
            description: 'Cinquenta mil reais em dinheiro vivo para você realizar seus sonhos.',
            product_name: 'Dinheiro',
            product_value: 5000000, // R$ 50.000,00 in cents
            total_tickets: 10000,
            ticket_price: 250,
            image_url: '/lovable-uploads/ea91f109-b805-487c-986c-b701fbc76222.png',
            status: 'active',
            created_at: new Date(Date.now() - 7 * 86400000).toISOString()
          }];
          rafflesData = mockRaffles;
        }

        setRaffles(rafflesData);
      } catch (error) {
        console.error('Error fetching raffles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, []);

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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ganhaveis Ativos</h1>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => navigate('/lance-seu-ganhavel')}>
              <Plus className="w-4 h-4 mr-2" />
              Lançar Ganhavel
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ganhaveis Ativos</h1>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => navigate('/lance-seu-ganhavel')}>
              <Plus className="w-4 h-4 mr-2" />
              Lançar Ganhavel
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Gift className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum ganhavel ativo</h3>
            <p className="text-muted-foreground text-center">
              No momento não há ganhaveis ativos. Volte em breve para conferir novas oportunidades!
            </p>
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
            Participe dos ganhaveis e concorra a prêmios incríveis!
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={() => navigate('/lance-seu-ganhavel')}>
            <Plus className="w-4 h-4 mr-2" />
            Lançar Ganhavel
          </Button>
        </div>
      </div>
      
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
                    {raffle.product_name}
                  </CardDescription>
                </div>
                <Badge variant="default">Ativa</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {raffle.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {raffle.description}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-muted-foreground" />
                    <span>Prêmio: {formatCurrency(raffle.product_value || 0)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{raffle.total_tickets} tickets</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Desde: {formatDate(raffle.created_at)}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Ticket:</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(raffle.ticket_price || 0)}
                    </span>
                  </div>
                  
                  <Button className="w-full" asChild>
                    <Link to={`/raffles/${raffle.id}`}>
                      Ver Ganhavel
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