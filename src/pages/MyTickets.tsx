import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, Calendar, DollarSign, ArrowLeft, Search, Plus, Share2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProgressBar from '@/components/ui/progress-bar';
import CompartilheRifa from '@/components/CompartilheRifa';
import { formatBRL } from '@/lib/formatters';

// Helper to safely convert numbers to string combos
function toComboString(input: unknown): string {
  try {
    if (typeof input === "string") return input.replace(/[^\d-]/g, "");
    if (Array.isArray(input)) {
      const flat = (input as unknown[]).flat(2).map(x => String(x).replace(/[^\d]/g, ""));
      return flat.filter(Boolean).join("-");
    }
    return String(input ?? "").replace(/[^\d-]/g, "");
  } catch {
    return "";
  }
}

interface TransactionWithRaffle {
  id: string;
  raffle_id: string;
  amount: number;
  status: string;
  created_at: string;
  numbers: unknown;
  selected_numbers: unknown;
  raffles_public_money_ext: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    ticket_price: number;
    goal_amount: number;
    amount_raised: number;
    progress_pct_money: number;
    status: string;
  } | null;
}

export default function MyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionWithRaffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            id,
            raffle_id,
            amount,
            status,
            created_at,
            numbers,
            selected_numbers,
            raffles_public_money_ext!inner(
              id,
              title,
              description,
              image_url,
              ticket_price,
              goal_amount,
              amount_raised,
              progress_pct_money,
              status
            )
          `)
          .eq('buyer_user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const formatCurrency = (amount: number) => {
    return formatBRL(amount);
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
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'default';
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
      case 'expired':
        return 'Expirado';
      case 'cancelled':
        return 'Cancelado';
      case 'completed':
        return 'Concluído';
      default:
        return String(status || 'Desconhecido');
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

  if (transactions.length === 0) {
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
        {transactions.map((transaction) => {
          const raffle = transaction.raffles_public_money_ext;
          // Get numbers from either numbers or selected_numbers field
          const rawNumbers = transaction.numbers || transaction.selected_numbers;
          const numbersArray = Array.isArray(rawNumbers) 
            ? (rawNumbers as unknown[]).map(toComboString).filter(Boolean)
            : [];
          
          // Calculate quantity from numbers array length or default to 1
          const quantity = Math.max(1, numbersArray.length);

          return (
            <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="w-5 h-5" />
                      {String(raffle?.title || 'Ganhavel Indisponível')}
                    </CardTitle>
                    <CardDescription>
                      {String(raffle?.description || '')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(transaction.status)}>
                      {getStatusLabel(transaction.status)}
                    </Badge>
                    {raffle?.id && (
                      <CompartilheRifa raffleId={raffle.id} size={120} className="w-6 h-6" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Transaction Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>Valor: {formatCurrency(Number(transaction.amount) || 0)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>Compra: {formatDate(transaction.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-muted-foreground" />
                      <span>Quantidade: {quantity} ticket(s)</span>
                    </div>
                  </div>

                  {/* Purchased Numbers */}
                  {numbersArray.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Números Comprados:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {numbersArray.map((combo, idx) => (
                          <div key={idx} className="text-xs font-mono bg-muted px-2 py-1 rounded">
                            {String(combo)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raffle Progress */}
                  {raffle && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progresso da Rifa:</span>
                        <span className="font-medium">
                          {formatCurrency(Number(raffle.amount_raised) || 0)} / {formatCurrency(Number(raffle.goal_amount) || 0)}
                        </span>
                      </div>
                      <ProgressBar 
                        value={Number(raffle.progress_pct_money) || 0} 
                        className="h-2"
                        showLabel={false}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {Number(raffle.progress_pct_money) || 0}% concluído
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {raffle?.id && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/ganhaveis/${raffle.id}`}>
                          Ver Ganhavel
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}