import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XCircle, AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

interface PaymentDetails {
  status: 'overdue' | 'refunded' | 'failed';
  amount: number;
  raffleTitle: string;
  raffleId: string;
  reason?: string;
  createdAt: string;
}

export default function PagamentoRecusado() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      console.log('[PaymentDeclined] Fetching details for payment:', paymentId);
      
      // This would query our payments table
      // For now, showing mock data since we haven't implemented the full DB schema
      setPaymentDetails({
        status: 'overdue',
        amount: 25.00,
        raffleTitle: 'iPhone 15 Pro Max',
        raffleId: 'raffle-123',
        reason: 'Pagamento não foi realizado dentro do prazo',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('[PaymentDeclined] Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const tryAgain = () => {
    if (paymentDetails?.raffleId) {
      navigate(`/rifa/${paymentDetails.raffleId}`);
    } else {
      navigate('/');
    }
  };

  const goHome = () => {
    navigate('/');
  };

  const getStatusInfo = () => {
    if (!paymentDetails) return { icon: XCircle, title: 'Pagamento não concluído', color: 'red' };

    switch (paymentDetails.status) {
      case 'overdue':
        return {
          icon: AlertTriangle,
          title: 'Pagamento Vencido',
          color: 'orange',
          description: 'O prazo para pagamento expirou'
        };
      case 'refunded':
        return {
          icon: XCircle,
          title: 'Pagamento Estornado',
          color: 'blue',
          description: 'O pagamento foi estornado'
        };
      default:
        return {
          icon: XCircle,
          title: 'Pagamento não concluído',
          color: 'red',
          description: 'Houve um problema com seu pagamento'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const IconComponent = statusInfo.icon;

  return (
    <>
      <SEOHead
        title="Pagamento não concluído - Ganhavel"
        description="Houve um problema com seu pagamento. Tente novamente ou entre em contato com o suporte."
        canonical="/pagamento/recusado"
      />
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className={`h-12 w-12 text-${statusInfo.color}-600`} />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {statusInfo.title}
            </h1>
            <p className="text-muted-foreground">
              {statusInfo.description}
            </p>
          </div>

          {paymentDetails && (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes do Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rifa:</span>
                    <span className="font-medium">{paymentDetails.raffleTitle}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium">
                      R$ {paymentDetails.amount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium text-${statusInfo.color}-600`}>
                      {paymentDetails.status === 'overdue' ? 'Vencido' : 
                       paymentDetails.status === 'refunded' ? 'Estornado' : 'Falhou'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Data:</span>
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

              {paymentDetails.reason && (
                <Alert className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {paymentDetails.reason}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="space-y-3">
            <Button 
              onClick={tryAgain}
              className="w-full"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button 
              variant="outline"
              onClick={goHome}
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Se você acredita que houve um erro, entre em contato com nosso suporte.
            </p>
            <Button variant="link" className="text-xs mt-2">
              Falar com o Suporte
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}