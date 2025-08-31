import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shuffle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeFivePairs, generateFiveRandomPairs } from "@/lib/clientTicketSanitizer";

interface PaymentTestFormProps {
  ganhavel_id?: string;
  amount?: number;
}

export default function PaymentTestForm({ ganhavel_id = "test-ganhavel", amount = 1000 }: PaymentTestFormProps) {
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [currency] = useState("BRL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ticketNumbers, setTicketNumbers] = useState<string[]>(generateFiveRandomPairs());
  const { user } = useAuth();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para fazer um pagamento');
      return;
    }

    if (paymentAmount < 100) {
      toast.error('Valor mínimo é R$ 1,00');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('Calling payment creation with:', {
        amount: paymentAmount,
        currency,
        user_id: user.id,
        raffle_id: ganhavel_id
      });

      // Sanitize ticket numbers before sending
      const sanitizedNumbers = sanitizeFivePairs(ticketNumbers);

      const { data, error } = await supabase.functions.invoke('payments-handle/create', {
        body: {
          amount: paymentAmount,
          currency,
          user_id: user.id,
          raffle_id: ganhavel_id,
          ticket_count: Math.floor(paymentAmount / 100),
          selected_numbers: sanitizedNumbers
        }
      });

      if (error) {
        console.error('Payment creation error:', error);
        throw error;
      }

      console.log('Payment created successfully:', data);

      if (data?.checkout_url) {
        toast.success('Redirecionando para o checkout...');
        window.location.href = data.checkout_url;
      } else {
        throw new Error('URL de checkout não recebida');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Erro ao processar pagamento: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faça Login</CardTitle>
          <CardDescription>
            Você precisa estar logado para fazer um pagamento
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Pagamento de Teste
        </CardTitle>
        <CardDescription>
          Sistema de pagamento simulado para desenvolvimento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (em centavos)</Label>
            <Input
              id="amount"
              type="number"
              min="100"
              step="100"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 100)}
              placeholder="1000 = R$ 10,00"
            />
            <p className="text-xs text-muted-foreground">
              Valor: R$ {(paymentAmount / 100).toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Ganhavel ID</Label>
            <Input
              value={ganhavel_id}
              disabled
              className="text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label>Usuário</Label>
            <Input
              value={user.email || 'N/A'}
              disabled
              className="text-muted-foreground"
            />
          </div>

          {/* Ticket Numbers Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Números dos Bilhetes (5 dezenas)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTicketNumbers(generateFiveRandomPairs())}
                className="flex items-center gap-1"
              >
                <Shuffle className="w-3 h-3" />
                Aleatório
              </Button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {ticketNumbers.map((number, index) => (
                <Input
                  key={index}
                  value={number}
                  onChange={(e) => {
                    const newNumbers = [...ticketNumbers];
                    const value = e.target.value.replace(/\D/g, '');
                    newNumbers[index] = value.slice(-2).padStart(2, '0');
                    setTicketNumbers(newNumbers);
                  }}
                  placeholder="00"
                  maxLength={2}
                  className="text-center font-mono"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Escolha 5 dezenas (00–99). Duplicatas são permitidas.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Ambiente de Desenvolvimento</strong><br />
              Este é um pagamento simulado. Nenhuma cobrança real será efetuada.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? "Processando..." : "Simular Pagamento"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}