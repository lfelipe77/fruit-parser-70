import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Copy, Eye, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import { toast } from '@/hooks/use-toast';

interface PaymentDetails {
  transactionId: string;
  reservationId: string;
  raffleId: string;
  raffleTitle: string;
  provider: string;
  providerPaymentId: string;
  amount: number;
  ticketNumbers: number[];
  ticketCount: number;
  createdAt: string;
}

const PagamentoSucesso: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const reservationId = searchParams.get('reservationId') || searchParams.get('reservation_id');

  const fetchPaymentDetails = async () => {
    if (!reservationId) {
      console.error('No reservation ID provided');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Check reservation audit
      const { data: reservationAudit, error: auditError } = await supabase
        .rpc('get_reservation_audit', { p_reservation_id: reservationId });
      
      if (auditError) {
        console.error('Error fetching reservation audit:', auditError);
        return;
      }

      // Step 2: If not paid, try to finalize via payment-status
      if (reservationAudit && !reservationAudit.all_paid) {
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke('payment-status', {
            body: { reservationId }
          });

          if (statusError) {
            console.error('Error checking payment status:', statusError);
          } else {
            console.log('Payment status response:', statusData);
          }
        } catch (statusCheckError) {
          console.error('Error during payment status check:', statusCheckError);
        }
      }

      // Step 3: Try to get purchase summary (finalized transaction)
      const { data: purchaseSummary, error: summaryError } = await supabase
        .rpc('purchase_summary_by_reservation', { p_reservation_id: reservationId });

      if (summaryError) {
        console.error('Error fetching purchase summary:', summaryError);
      }

      if (purchaseSummary && purchaseSummary.length > 0) {
        const summary = purchaseSummary[0];
        
        // Get raffle title
        const { data: raffleData } = await supabase
          .from('raffles')
          .select('title')
          .eq('id', summary.raffle_id)
          .single();

        setPaymentDetails({
          transactionId: summary.transaction_id,
          reservationId: summary.reservation_id,
          raffleId: summary.raffle_id,
          raffleTitle: raffleData?.title || 'Ganhavel',
          provider: summary.provider || 'PIX',
          providerPaymentId: summary.provider_payment_id || '',
          amount: summary.amount || 0,
          ticketNumbers: Array.isArray(summary.numbers) ? summary.numbers.map(n => Number(n)) : [],
          ticketCount: Number(summary.qty) || 1,
          createdAt: summary.created_at
        });

        // Dispatch events to refresh UI
        window.dispatchEvent(new CustomEvent("raffleUpdated", { detail: { raffle_id: summary.raffle_id } }));
        window.dispatchEvent(new Event("ticketsUpdated"));
      } else {
        // Step 4: Fallback to preview (unpaid reservation)
        const { data: purchasePreview, error: previewError } = await supabase
          .rpc('purchase_preview_by_reservation', { p_reservation_id: reservationId });

        if (previewError) {
          console.error('Error fetching purchase preview:', previewError);
        }

        if (purchasePreview && purchasePreview.length > 0) {
          const preview = purchasePreview[0];
          
          // Get raffle title
          const { data: raffleData } = await supabase
            .from('raffles')
            .select('title')
            .eq('id', preview.raffle_id)
            .single();

          setPaymentDetails({
            transactionId: '',
            reservationId: preview.reservation_id,
            raffleId: preview.raffle_id,
            raffleTitle: raffleData?.title || 'Ganhavel',
            provider: 'PIX',
            providerPaymentId: '',
            amount: preview.total_amount || 0,
            ticketNumbers: Array.isArray(preview.numbers) ? preview.numbers.map(n => Number(n)) : [],
            ticketCount: Number(preview.qty) || 1,
            createdAt: new Date().toISOString()
          });
        } else {
          // Set default fallback
          setPaymentDetails({
            transactionId: '',
            reservationId: reservationId,
            raffleId: '',
            raffleTitle: 'Ganhavel',
            provider: 'PIX',
            providerPaymentId: '',
            amount: 0,
            ticketNumbers: [],
            ticketCount: 1,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchPaymentDetails:', error);
      // Set default fallback data
      setPaymentDetails({
        transactionId: '',
        reservationId: reservationId || '',
        raffleId: '',
        raffleTitle: 'Ganhavel',
        provider: 'PIX',
        providerPaymentId: '',
        amount: 0,
        ticketNumbers: [],
        ticketCount: 1,
        createdAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [reservationId]);

  const copyTicketNumbers = () => {
    if (paymentDetails?.ticketNumbers.length) {
      const numbersText = paymentDetails.ticketNumbers.sort((a, b) => a - b).join(', ');
      navigator.clipboard.writeText(numbersText);
      toast({
        title: "Copiado!",
        description: "Números dos bilhetes copiados para a área de transferência.",
      });
    }
  };

  const goToMyTickets = () => {
    navigate('/dashboard');
  };

  const goBackToRaffle = () => {
    if (paymentDetails?.raffleId) {
      navigate(`/ganhavel/${paymentDetails.raffleId}`);
    } else {
      navigate('/descobrir');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Pagamento Confirmado - Ganhavel"
        description="Seu pagamento foi processado com sucesso! Confira seus bilhetes na sua conta."
        canonical="/pagamento/sucesso"
      />
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Sua compra foi processada com sucesso
            </p>
          </div>

          {paymentDetails && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Resumo da Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ganhavel:</span>
                  <span className="font-medium">{paymentDetails.raffleTitle}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bilhetes:</span>
                  <span className="font-medium">{paymentDetails.ticketCount}</span>
                </div>

                {paymentDetails.ticketNumbers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Números:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyTicketNumbers}
                        className="h-auto p-1"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {paymentDetails.ticketNumbers
                          .sort((a, b) => a - b)
                          .map((number) => (
                            <span 
                              key={number}
                              className="px-2 py-1 bg-primary text-primary-foreground rounded text-sm font-medium"
                            >
                              {number.toString().padStart(5, '0')}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor pago:</span>
                  <span className="font-medium text-green-600">
                    R$ {paymentDetails.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {paymentDetails.provider && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Método:</span>
                    <span className="font-medium">{paymentDetails.provider.toUpperCase()}</span>
                  </div>
                )}

                {paymentDetails.providerPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Pagamento:</span>
                    <span className="font-medium text-xs text-muted-foreground">
                      {paymentDetails.providerPaymentId}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span className="font-medium">
                    {new Date(paymentDetails.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
              Ver Ganhavel
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Você receberá uma confirmação por email em breve.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Em caso de dúvidas, entre em contato com nosso suporte.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PagamentoSucesso;