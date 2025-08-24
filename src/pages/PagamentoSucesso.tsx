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
  const reservation_id = sp.get("res");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId, reservation_id]);

  const fetchPaymentDetails = async () => {
    try {
      console.log('[PaymentSuccess] Fetching details for payment:', paymentId, 'reservation:', reservation_id);
      
      if (reservation_id) {
        // Handle reservation-based payment (future implementation)
        console.log("[PagamentoSucesso] Reservation payment:", reservation_id);
      }
      
      // Use standard payment flow for now
      setPaymentDetails({
        amount: 25.00,
        raffleTitle: 'iPhone 15 Pro Max',
        ticketCount: 1,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[PaymentSuccess] Error fetching payment details:', error);
      // Fallback to mock data on error
      setPaymentDetails({
        amount: 25.00,
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