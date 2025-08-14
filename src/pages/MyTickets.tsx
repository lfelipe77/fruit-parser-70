import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

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

        setTickets(data || []);
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
        <h1 className="text-3xl font-bold mb-8">Meus Tickets</h1>
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
        <h1 className="text-3xl font-bold mb-8">Meus Tickets</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum ticket encontrado</h3>
            <p className="text-muted-foreground text-center mb-6">
              Você ainda não participou de nenhuma rifa. Explore as rifas disponíveis e tente a sorte!
            </p>
            <Button asChild>
              <Link to="/#/raffles">Ver Rifas Disponíveis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Meus Tickets</h1>
      
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket className="w-5 h-5" />
                    {ticket.raffles?.title || 'Rifa Indisponível'}
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
                    <Link to={`/#/raffles/${ticket.raffles.id}`}>
                      Ver Rifa
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