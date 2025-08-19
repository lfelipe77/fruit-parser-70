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
          const rawNumbers = transaction.numbers || transaction.selected_numbers;
          const numbersArray = Array.isArray(rawNumbers) 
            ? (rawNumbers as unknown[]).map(toComboString).filter(Boolean)
            : [];
          
          const quantity = Math.max(1, numbersArray.length);
          const pct = Math.max(0, Math.min(100, Number(raffle?.progress_pct_money) || 0));
          const moneyNow = Number(raffle?.amount_raised) || 0;
          const moneyGoal = Number(raffle?.goal_amount) || 0;

          return (
            <Card key={transaction.id} className="overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-32">
                {/* Image Section */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  {raffle?.image_url ? (
                    <img src={raffle.image_url} alt={String(raffle.title)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Ticket className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={getStatusColor(transaction.status)} className="text-xs px-1.5 py-0.5">
                      {getStatusLabel(transaction.status)}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 space-y-3">
                  {/* Title and Money */}
                  <div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-1 mb-1">
                      {String(raffle?.title || 'Ganhavel Indisponível')}
                    </h3>
                    <div className="text-xs font-medium">
                      {formatCurrency(moneyNow)} de {formatCurrency(moneyGoal)}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-success to-success/80 transition-[width] duration-500 ease-out" 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pct}%</span>
                      <span>{quantity} bilhetes</span>
                    </div>
                  </div>

                  {/* Lucky Numbers */}
                  {numbersArray.length > 0 && (
                    <div className="flex gap-1.5">
                      {numbersArray.slice(0, 4).map((combo, idx) => (
                        <div key={idx} className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border">
                          {String(combo)}
                        </div>
                      ))}
                      {numbersArray.length > 4 && (
                        <div className="text-xs text-muted-foreground px-2 py-1">
                          +{numbersArray.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QR Section */}
                <div className="w-20 h-32 flex flex-col items-center justify-center border-l bg-muted/30 p-2">
                  {raffle?.id && (
                    <>
                      <CompartilheRifa raffleId={raffle.id} size={60} className="w-12 h-12 mb-2" />
                      <div className="text-xs text-center text-muted-foreground">
                        Compartilhar
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="px-4 pb-3">
                {raffle?.id && (
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs" asChild>
                    <Link to={`/ganhaveis/${raffle.id}`}>
                      Ver Ganhavel
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}