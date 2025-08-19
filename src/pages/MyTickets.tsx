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
      
      <div className="grid gap-6">
        {transactions.map((transaction) => {
          const raffle = transaction.raffles_public_money_ext;
          // Get numbers from either numbers or selected_numbers field
          const rawNumbers = transaction.numbers || transaction.selected_numbers;
          const numbersArray = Array.isArray(rawNumbers) 
            ? (rawNumbers as unknown[]).map(toComboString).filter(Boolean)
            : [];
          
          // Calculate quantity from numbers array length or default to 1
          const quantity = Math.max(1, numbersArray.length);
          const pct = Math.max(0, Math.min(100, Number(raffle?.progress_pct_money) || 0));
          const moneyNow = Number(raffle?.amount_raised) || 0;
          const moneyGoal = Number(raffle?.goal_amount) || 0;

          return (
            <Card key={transaction.id} className="group overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow">
              {/* Image Header */}
              <div className="relative h-44 w-full overflow-hidden">
                {raffle?.image_url ? (
                  <img src={raffle.image_url} alt={String(raffle.title)} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Ticket className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Status Badge Overlay */}
                <div className="absolute top-3 left-3">
                  <Badge variant={getStatusColor(transaction.status)} className="shadow-sm">
                    {getStatusLabel(transaction.status)}
                  </Badge>
                </div>

                {/* QR Code Overlay */}
                {raffle?.id && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1.5">
                      <CompartilheRifa raffleId={raffle.id} size={80} className="w-8 h-8" />
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Title and Description */}
                  <div>
                    <h3 className="font-semibold text-lg leading-snug line-clamp-1 mb-2">
                      {String(raffle?.title || 'Ganhavel Indisponível')}
                    </h3>
                    {raffle?.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {String(raffle.description)}
                      </p>
                    )}
                  </div>

                  {/* Money Progress - Main Feature */}
                  {raffle && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progresso do Ganhavel</span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(moneyNow)} de {formatCurrency(moneyGoal)}
                        </span>
                      </div>
                      
                      {/* Enhanced Progress Bar */}
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-3 bg-gradient-to-r from-success to-success/80 transition-[width] duration-500 ease-out rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{pct}% arrecadado</span>
                        <span>Seus bilhetes</span>
                      </div>
                    </div>
                  )}

                  {/* My Tickets Section */}
                  <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-primary" />
                        Meus Bilhetes
                      </h4>
                      <span className="text-sm font-semibold text-primary">
                        {quantity} ticket(s)
                      </span>
                    </div>

                    {/* Purchased Numbers */}
                    {numbersArray.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Números comprados:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {numbersArray.slice(0, 6).map((combo, idx) => (
                            <div key={idx} className="text-xs font-mono bg-primary/10 text-primary px-2 py-1.5 rounded-lg text-center">
                              {String(combo)}
                            </div>
                          ))}
                          {numbersArray.length > 6 && (
                            <div className="text-xs text-muted-foreground px-2 py-1.5 text-center">
                              +{numbersArray.length - 6} mais
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Transaction Details */}
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatCurrency(Number(transaction.amount) || 0)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(transaction.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {raffle?.id && (
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link to={`/ganhaveis/${raffle.id}`}>
                          <Share2 className="w-4 h-4 mr-2" />
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