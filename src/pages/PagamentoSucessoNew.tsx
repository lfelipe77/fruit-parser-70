import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Eye, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { getReservationAudit } from "@/services/checkout";
import { useToast } from "@/hooks/use-toast";

interface ReservationAuditData {
  ticket_count: number;
  all_paid: boolean;
  any_paid: boolean;
  ticket_numbers: string[];
  ticket_statuses: string[];
  last_provider: string;
  last_provider_payment_id: string;
  last_tx_amount: number;
  last_tx_at: string;
  raffle_title?: string;
  raffle_id?: string;
}

export default function PagamentoSucessoNew() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [auditData, setAuditData] = useState<ReservationAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reservationId = searchParams.get('res');

  useEffect(() => {
    if (reservationId) {
      fetchReservationAudit();
    } else {
      setError('ID de reserva não encontrado na URL');
      setLoading(false);
    }
  }, [reservationId]);

  const fetchReservationAudit = async () => {
    try {
      console.log('[PaymentSuccess] Fetching audit data for reservation:', reservationId);
      const data = await getReservationAudit(supabase, reservationId!);
      
      if (!data) {
        throw new Error('Dados da reserva não encontrados');
      }

      console.log('[PaymentSuccess] Audit data received:', data);
      setAuditData(data);
    } catch (error) {
      console.error('[PaymentSuccess] Error fetching audit data:', error);
      setError(error instanceof Error ? error.message : 'Erro ao buscar dados da compra');
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da compra",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const goToMyTickets = () => {
    navigate('/my-tickets');
  };

  const goBackToRaffle = () => {
    if (auditData?.raffle_id) {
      navigate(`/rifa/${auditData.raffle_id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <>
        <SEOHead
          title="Carregando - Ganhavel"
          description="Carregando detalhes da compra..."
        />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando detalhes da compra...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !auditData) {
    return (
      <>
        <SEOHead
          title="Erro - Ganhavel"
          description="Erro ao carregar detalhes da compra"
        />
        <div className="min-h-screen bg-background py-12 px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Erro</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Compra Confirmada - Ganhavel"
        description={`Sua compra de ${auditData.ticket_count} bilhete(s) foi confirmada com sucesso!`}
        canonical={`/pagamento/sucesso/${paymentId}`}
      />
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Compra Confirmada!
            </h1>
            <p className="text-muted-foreground">
              Seus bilhetes foram confirmados com sucesso
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Detalhes da Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {auditData.raffle_title && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rifa:</span>
                  <span className="font-medium">{auditData.raffle_title}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bilhetes:</span>
                <span className="font-medium">{auditData.ticket_count}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Números:</span>
                <div className="text-right">
                  {auditData.ticket_numbers.length > 0 ? (
                    <div className="space-y-1">
                      {auditData.ticket_numbers.map((number, index) => (
                        <div key={index} className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {number}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Em processamento</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor pago:</span>
                <span className="font-medium text-green-600">
                  R$ {auditData.last_tx_amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${auditData.all_paid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {auditData.all_paid ? 'Todos pagos' : auditData.any_paid ? 'Parcialmente pago' : 'Pendente'}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data do pagamento:</span>
                <span>
                  {new Date(auditData.last_tx_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {paymentId && (
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">ID do pagamento:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">
                      {paymentId.length > 12 ? `${paymentId.substring(0, 8)}...` : paymentId}
                    </code>
                  </div>
                </div>
              )}

              {reservationId && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">ID da reserva:</span>
                  <code className="bg-muted px-2 py-1 rounded text-xs">
                    {reservationId.length > 12 ? `${reservationId.substring(0, 8)}...` : reservationId}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button 
              onClick={goToMyTickets}
              className="w-full"
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Meus Bilhetes
            </Button>
            
            <Button 
              variant="outline"
              onClick={goBackToRaffle}
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a Rifa
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              🎉 Parabéns! Boa sorte no sorteio!
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Em caso de dúvidas, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}