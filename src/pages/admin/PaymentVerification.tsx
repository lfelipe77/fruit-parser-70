import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Check, X, Clock } from 'lucide-react';

interface PaymentVerificationRecord {
  id: string;
  payer_name: string;
  amount: number;
  verified_status: 'verified' | 'pending' | 'rejected';
  payment_timestamp: string;
  raffle_title: string;
  raffle_id: string;
  verification_notes?: string;
}

export default function PaymentVerification() {
  const [payments, setPayments] = useState<PaymentVerificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Since the raffle_payment_verification view doesn't exist yet, 
      // let's use existing tables to simulate this data
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          status,
          created_at,
          user_id,
          raffle_id,
          payment_provider
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching payments:', error);
        return;
      }

      // Transform the data to match the expected structure
      const transformedData: PaymentVerificationRecord[] = data.map(tx => ({
        id: tx.id,
        payer_name: `User ${tx.user_id?.slice(0, 8)}`, // Simplified for now
        amount: tx.amount || 0,
        verified_status: tx.status === 'paid' ? 'verified' : 
                        tx.status === 'pending' ? 'pending' : 'rejected',
        payment_timestamp: tx.created_at,
        raffle_title: `Ganhavel ${tx.raffle_id?.slice(0, 8)}`, // Simplified for now
        raffle_id: tx.raffle_id || '',
        verification_notes: tx.payment_provider || undefined
      }));

      setPayments(transformedData);
    } catch (error) {
      console.error('Error in fetchPayments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.payer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.raffle_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.verified_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" />Verificado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Carregando verificações de pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Verificação de Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie e verifique todos os pagamentos da plataforma
          </p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou ganhavel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="verified">Verificado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {payments.filter(p => p.verified_status === 'verified').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter(p => p.verified_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(payments.filter(p => p.verified_status === 'verified').reduce((sum, p) => sum + p.amount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
          <CardDescription>
            {filteredPayments.length} pagamento{filteredPayments.length !== 1 ? 's' : ''} encontrado{filteredPayments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{payment.payer_name}</h3>
                        {getStatusBadge(payment.verified_status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Ganhavel:</strong> {payment.raffle_title}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Data:</strong> {formatDate(payment.payment_timestamp)}
                      </p>
                      {payment.verification_notes && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Provedor:</strong> {payment.verification_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-muted-foreground">ID: {payment.id.slice(0, 8)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}