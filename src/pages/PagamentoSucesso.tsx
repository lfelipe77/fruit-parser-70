import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

interface PaymentDetails {
  amount: number;
  raffleTitle: string;
  ticketCount: number;
  createdAt: string;
}

export default function PagamentoSucesso() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  // Accept both reservationId and legacy "res"
  const reservationId = sp.get("reservationId") || sp.get("res");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId, reservationId]);

  const fetchPaymentDetails = async () => {
    try {
      console.log('[PagamentoSucesso] Fetching details for payment:', paymentId, 'reservation:', reservationId);

      if (!reservationId && !paymentId) {
        setPaymentDetails({
          amount: 25.0,
          raffleTitle: 'Rifa',
          ticketCount: 1,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const jwt = session?.access_token;
      
      if (!jwt) {
        console.warn('[PagamentoSucesso] No JWT token found');
        setPaymentDetails({
          amount: 25.0,
          raffleTitle: 'Rifa',
          ticketCount: 1,
          createdAt: new Date().toISOString(),
        });
        return;
      }

      // 1) Check payment status first
      let statusResponse: any = null;
      let detectedReservationId = reservationId;
      
      if (reservationId || paymentId) {
        const EDGE_URL = "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1";
        const params = new URLSearchParams();
        if (reservationId) params.set('reservationId', reservationId);
        if (paymentId) params.set('paymentId', paymentId);
        
        try {
          const sres = await fetch(`${EDGE_URL}/payment-status?${params.toString()}`, {
            headers: { Authorization: `Bearer ${jwt}` }
          });
          statusResponse = await sres.json();
          detectedReservationId = statusResponse.reservationId || reservationId;
          console.log('[PagamentoSucesso] Status response:', statusResponse);
        } catch (statusError) {
          console.warn('[PagamentoSucesso] Status check failed:', statusError);
        }
      }

      // 2) Fallback finalize (idempotent) if status is PAID
      if (statusResponse?.status === "PAID" && detectedReservationId) {
        try {
          const EDGE_URL = "https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1";
          await fetch(`${EDGE_URL}/payment-finalize`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json", 
              Authorization: `Bearer ${jwt}` 
            },
            body: JSON.stringify({ 
              reservationId: detectedReservationId, 
              paymentId: statusResponse.paymentId || paymentId 
            })
          });
          console.log('[PagamentoSucesso] Fallback finalize called');
        } catch (finalizeError) {
          console.warn('[PagamentoSucesso] Fallback finalize failed:', finalizeError);
        }
      }

      // 3) Load UI data (paid tickets + transaction + raffle)
      if (detectedReservationId) {
        const { data: paidTicket } = await supabase
          .from('tickets')
          .select('transaction_id, raffle_id')
          .eq('reservation_id', detectedReservationId)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (paidTicket?.transaction_id) {
          const { data: tx } = await supabase
            .from('transactions')
            .select('id, amount, status, created_at, raffle_id, numbers')
            .eq('id', paidTicket.transaction_id)
            .maybeSingle();

          if (tx) {
            const { data: raffle } = await supabase
              .from('raffles')
              .select('title')
              .eq('id', tx.raffle_id)
              .maybeSingle();

            setPaymentDetails({
              amount: Number(tx.amount) || 0,
              raffleTitle: raffle?.title || 'Rifa',
              ticketCount: Array.isArray(tx.numbers) ? tx.numbers.length : 1,
              createdAt: tx.created_at || new Date().toISOString(),
            });
            return;
          }
        }
      }

      // 4) Fallback by paymentId if we have it
      if (paymentId) {
        const { data: byPid } = await supabase
          .from('transactions')
          .select('amount, created_at, status, raffle_id, numbers')
          .eq('provider_payment_id', paymentId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (byPid) {
          const { data: raffle } = await supabase
            .from('raffles')
            .select('title')
            .eq('id', byPid.raffle_id)
            .maybeSingle();
            
          setPaymentDetails({
            amount: Number(byPid.amount) || 0,
            raffleTitle: raffle?.title || 'Rifa',
            ticketCount: Array.isArray(byPid.numbers) ? byPid.numbers.length : 1,
            createdAt: byPid.created_at || new Date().toISOString(),
          });
          return;
        }
      }

      // Final fallback
      setPaymentDetails({
        amount: 25.0,
        raffleTitle: 'Rifa',
        ticketCount: 1,
        createdAt: new Date().toISOString(),
      });
      
    } catch (error) {
      console.error('[PagamentoSucesso] Error fetching payment details:', error);
      setPaymentDetails({ 
        amount: 25.0, 
        raffleTitle: 'Rifa', 
        ticketCount: 1, 
        createdAt: new Date().toISOString() 
      });
    } finally {
      setLoading(false);
    }
  };

  const goToMyTickets = () => {
    navigate('/my-tickets');
  };

  const goBackToRaffle = () => {
    // In a real implementation, we'd get the raffle ID from the payment
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
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
                <CheckCircle className="h-12 w-12 text-green-600" />
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
                  <span className="text-muted-foreground">Rifa:</span>
                  <span className="font-medium">{paymentDetails.raffleTitle}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bilhetes:</span>
                  <span className="font-medium">{paymentDetails.ticketCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor pago:</span>
                  <span className="font-medium text-green-600">
                    R$ {paymentDetails.amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Data do pagamento:</span>
                  <span>
                    {new Date(paymentDetails.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {paymentId && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">ID do pagamento:</span>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {paymentId.substring(0, 8)}...
                      </code>
                    </div>
                  </div>
                )}
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
              Voltar para a Rifa
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
}