import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentDetails {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  raffle_id: string; // Changed from ganhavel_id to raffle_id
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      const paymentId = searchParams.get('payment_id');
      
      if (!paymentId) {
        toast.error('ID do pagamento não encontrado');
        setLoading(false);
        return;
      }

      if (!user) {
        toast.error('Usuário não autenticado');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', paymentId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching payment:', error);
          toast.error('Erro ao buscar detalhes do pagamento');
        } else {
          setPaymentDetails(data);
          
          // Send success email
          try {
            await supabase.functions.invoke('send-email', {
              body: {
                to: user.email,
                subject: 'Pagamento Confirmado - Ganhavel',
                template: 'payment_receipt',
                variables: {
                  payment_id: paymentId,
                  amount: (data.amount / 100).toFixed(2)
                }
              }
            });
          } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Don't show error to user for email failure
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('Erro inesperado');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [searchParams, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Carregando detalhes do pagamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">Pagamento Confirmado!</CardTitle>
              <CardDescription>
                Seu pagamento foi processado com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentDetails && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold">Detalhes do Pagamento</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>ID:</span>
                      <span className="font-mono">{paymentDetails.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Valor:</span>
                      <span className="font-semibold">R$ {(paymentDetails.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-green-600 font-semibold capitalize">{paymentDetails.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span>{new Date(paymentDetails.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🎉 Parabéns!
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Sua participação foi confirmada! Agora é só aguardar o sorteio. 
                  Boa sorte e que você seja o próximo ganhador!
                </p>
              </div>

              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/my-tickets">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Ver Meus Tickets
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link to="/">
                    <Home className="w-4 h-4 mr-2" />
                    Voltar ao Início
                  </Link>
                </Button>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Um comprovante foi enviado para seu email
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}