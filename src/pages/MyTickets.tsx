import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, Calendar, DollarSign, ArrowLeft, Search, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface TicketWithRaffle {
  id: string;
  ticket_number: number;
  quantity: number;
  total_amount: number;
  payment_status: string;
  created_at: string;
  raffles: {
    id: string;
    title: string;
    product_name: string;
    ticket_price: number;
    image_url: string;
    status: string;
  } | null;
}

export default function MyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketWithRaffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_number,
            quantity,
            total_amount,
            payment_status,
            created_at,
            raffles (
              id,
              title,
              product_name,
              ticket_price,
              image_url,
              status
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        let ticketsData = data || [];

        // Add mock data in development if no real data exists
        if (process.env.NODE_ENV === 'development' && ticketsData.length === 0) {
          const mockTickets: TicketWithRaffle[] = [{
            id: 'mock-ticket-1',
            ticket_number: 101,
            quantity: 1,
            total_amount: 1000, // R$ 10.00 in cents
            payment_status: 'paid',
            created_at: new Date().toISOString(),
            raffles: {
              id: 'mock-raffle-1',
              title: 'Carro 0km Honda Civic 2024',
              product_name: 'Honda Civic',
              ticket_price: 1000,
              image_url: '/lovable-uploads/4f6691ae-418c-477c-9958-16166ad9f887.png',
              status: 'active'
            }
          }, {
            id: 'mock-ticket-2',
            ticket_number: 205,
            quantity: 2,
            total_amount: 1000,
            payment_status: 'paid',
            created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            raffles: {
              id: 'mock-raffle-2',
              title: 'iPhone 15 Pro Max 256GB',
              product_name: 'iPhone 15 Pro Max',
              ticket_price: 500,
              image_url: '/lovable-uploads/67eff453-d5b1-47f9-a141-e80286a38ba0.png',
              status: 'active'
            }
          }];
          ticketsData = mockTickets as any;
        }

        setTickets(ticketsData);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'pending':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meus Tickets</h1>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button variant="outline" onClick={() => navigate('/raffles')}>
            <Search className="w-4 h-4 mr-2" />
            Explorar Ganhaveis
          </Button>
          <Button onClick={() => navigate('/lance-seu-ganhavel')}>
            <Plus className="w-4 h-4 mr-2" />
            Lançar Ganhavel
          </Button>
        </div>
      </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Meus Tickets</h1>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button variant="outline" onClick={() => navigate('/raffles')}>
              <Search className="w-4 h-4 mr-2" />
              Explorar Ganhaveis
            </Button>
            <Button onClick={() => navigate('/lance-seu-ganhavel')}>
              <Plus className="w-4 h-4 mr-2" />
              Lançar Ganhavel
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum ticket encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              Você ainda não participou de nenhum ganhavel. Explore os ganhaveis disponíveis e tente a sorte!
            </p>
            <Button asChild>
              <Link to="/raffles">Ver Ganhaveis Disponíveis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Meus Tickets</h1>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button variant="outline" onClick={() => navigate('/raffles')}>
            <Search className="w-4 h-4 mr-2" />
            Explorar Ganhaveis
          </Button>
          <Button onClick={() => navigate('/lance-seu-ganhavel')}>
            <Plus className="w-4 h-4 mr-2" />
            Lançar Ganhavel
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    {ticket.raffles?.title || 'Ganhavel Indisponível'}
                    {ticket.ticket_number && (
                      <Badge variant="outline">#{ticket.ticket_number}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {ticket.raffles?.product_name}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(ticket.payment_status)}>
                  {getStatusLabel(ticket.payment_status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>Valor: {formatCurrency(ticket.total_amount || 0)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Compra: {formatDate(ticket.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span>Quantidade: {ticket.quantity || 1} ticket(s)</span>
                </div>
              </div>
              
              {ticket.raffles && (
                <div className="mt-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/raffles/${ticket.raffles.id}`}>
                      Ver Ganhavel
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}