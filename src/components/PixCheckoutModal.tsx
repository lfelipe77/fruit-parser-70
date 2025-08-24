import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Clock, CheckCircle, Loader2, XCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePixCheckout } from "@/hooks/usePixCheckout";
import { supabase } from "@/integrations/supabase/client";
import { CustomerInfo } from "@/services/checkout";

interface PixCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffleId: string;
  ticketPrice: number;
  quantity: number;
  onSuccess: (paymentId: string, reservationId: string) => void;
}

export function PixCheckoutModal({
  isOpen,
  onClose,
  raffleId,
  ticketPrice,
  quantity,
  onSuccess
}: PixCheckoutModalProps) {
  const { toast } = useToast();
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    email: '',
    cpf: '',
    phone: ''
  });

  const edgeUrl = 'https://whqxpuyjxoiufzhvqneg.supabase.co';
  const { state, start, retry, isLoading, isWaiting, isError, isConfirmed } = usePixCheckout({
    supabase,
    edgeUrl
  });

  const totalAmount = ticketPrice * quantity;

  const handleConfirm = async () => {
    if (!customer.name.trim() || !customer.email.trim()) {
      toast({
        title: "Dados obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await start({
        raffleId,
        qty: quantity,
        amount: totalAmount,
        customer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          cpf: customer.cpf?.trim(),
          phone: customer.phone?.trim()
        }
      });

      if (result) {
        onSuccess(result.payment_id, result.reservation_id);
      }
    } catch (error) {
      console.error('[PixCheckout] Start failed:', error);
      // Error is already handled in the hook
    }
  };

  const handleRetry = () => {
    retry({
      raffleId,
      qty: quantity,
      amount: totalAmount,
      customer
    });
  };

  const copyPixPayload = async () => {
    if (!state.qr?.payload) return;

    try {
      await navigator.clipboard.writeText(state.qr.payload);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código",
        variant: "destructive"
      });
    }
  };

  const getTimeLeft = () => {
    if (!state.qr?.expiresAt) return 0;
    const expiration = new Date(state.qr.expiresAt);
    const now = new Date();
    const diffMs = expiration.getTime() - now.getTime();
    return Math.max(0, Math.floor(diffMs / 1000 / 60));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Compra</DialogTitle>
        </DialogHeader>

        {state.step === 'idle' && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Bilhetes:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Valor unitário:</span>
                <span className="font-medium">R$ {ticketPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>Total:</span>
                <span>R$ {totalAmount.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  value={customer.name}
                  onChange={(e) => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={customer.cpf}
                  onChange={(e) => setCustomer(prev => ({ ...prev, cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={customer.phone}
                  onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full" size="lg">
              Confirmar Compra
            </Button>
          </div>
        )}

        {isLoading && !isWaiting && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {state.step === 'reserving' && 'Reservando bilhetes...'}
              {state.step === 'charging' && 'Gerando pagamento PIX...'}
            </p>
          </div>
        )}

        {isWaiting && state.qr && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border inline-block">
                <img 
                  src={state.qr.encodedImage} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">PIX Copia e Cola:</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded border overflow-hidden">
                    {state.qr.payload.substring(0, 50)}...
                  </code>
                  <Button size="sm" variant="outline" onClick={copyPixPayload}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <div className="font-medium">
                    R$ {totalAmount.toFixed(2).replace('.', ',')}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Expira em:</span>
                  <div className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getTimeLeft()}min
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="animate-pulse mb-2">
                <CheckCircle className="h-8 w-8 mx-auto text-yellow-500" />
              </div>
              <p className="font-medium">Aguardando pagamento...</p>
              <p className="text-sm text-muted-foreground">
                Verificando automaticamente a cada 3 segundos
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className="text-center py-8 space-y-4">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <div>
              <p className="font-medium text-red-600">Erro no pagamento</p>
              <p className="text-sm text-muted-foreground mt-1">
                {state.error}
              </p>
            </div>
            <Button onClick={handleRetry} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}

        {isConfirmed && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="font-medium text-green-600">Pagamento confirmado!</p>
            <p className="text-sm text-muted-foreground">
              Redirecionando...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}