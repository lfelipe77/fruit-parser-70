import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, Copy, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { onlyDigits } from "@/helpers/ids";

interface AsaasCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  raffleId: string;
  ticketPrice: number;
  quantity: number;
  onSuccess: (paymentId: string) => void;
}

interface PixQrData {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

interface PaymentStatus {
  status: 'created' | 'received' | 'confirmed' | 'overdue' | 'refunded';
  updatedAt: string;
  providerPaymentId: string;
}

export function AsaasCheckoutDrawer({
  isOpen,
  onClose,
  raffleId,
  ticketPrice,
  quantity,
  onSuccess
}: AsaasCheckoutDrawerProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'loading' | 'payment' | 'waiting'>('loading');
  const [pixData, setPixData] = useState<PixQrData | null>(null);
  const [paymentId, setPaymentId] = useState<string>('');
  const [localPaymentId, setLocalPaymentId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [polling, setPolling] = useState(false);
  const [pixQrId, setPixQrId] = useState<string>('');

  const useAsaas = process.env.NODE_ENV === 'production' ? 
    localStorage.getItem('USE_ASAAS') === 'true' : true;

  console.log('[Checkout] Component mounted, useAsaas:', useAsaas);

  useEffect(() => {
    if (isOpen && useAsaas) {
      initializePayment();
    }
  }, [isOpen, useAsaas]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'waiting' && polling) {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, polling, localPaymentId]);

  useEffect(() => {
    if (pixData?.expirationDate) {
      const expiration = new Date(pixData.expirationDate);
      const now = new Date();
      const diffMs = expiration.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / 1000 / 60);
      
      setTimeLeft(Math.max(0, diffMinutes));

      const timer = setInterval(() => {
        const now = new Date();
        const diffMs = expiration.getTime() - now.getTime();
        const diffMinutes = Math.floor(diffMs / 1000 / 60);
        setTimeLeft(Math.max(0, diffMinutes));
      }, 60000); // Update every minute

      return () => clearInterval(timer);
    }
  }, [pixData]);

  const initializePayment = async () => {
    if (!useAsaas) {
      console.log('[Checkout] Asaas disabled, skipping payment initialization');
      return;
    }

    try {
      console.log('[Checkout] Initializing payment...');
      setStep('loading');

      // Step 1: Reservar bilhetes (v2) para obter reservation_id
      const { data: resv, error: resvErr } = await supabase.rpc('reserve_tickets_v2', {
        p_raffle_id: raffleId,
        p_qty: quantity,
      });
      if (resvErr) {
        throw new Error('Erro ao reservar bilhetes: ' + resvErr.message);
      }
      const resEntry = Array.isArray(resv) ? resv[0] : null;
      const reservationId = resEntry?.reservation_id as string;
      if (!reservationId) {
        throw new Error('Falha ao criar reserva.');
      }

      // Step 2: Buscar perfil para validar CPF/CNPJ
      const { data: sess } = await supabase.auth.getSession();
      const authUser = sess?.session?.user;
      if (!authUser) {
        throw new Error('Faça login para continuar.');
      }

      const { data: prof } = await supabase
        .from('user_profiles')
        .select('full_name, tax_id')
        .eq('id', authUser.id)
        .maybeSingle();

      const name = (prof?.full_name || authUser.user_metadata?.name || 'Cliente').toString();
      const email = (authUser.email || '').toString();
      
      // Extract document but don't block - let server handle validation
      const docRaw = onlyDigits((prof as any)?.tax_id || '');
      const mobilePhone = '';

      console.log('[checkout] sending doc', { docRaw, len: docRaw.length, validate: 'loose' });

      // Step 3: Create complete PIX payment - send document without blocking
      const total = ticketPrice * quantity;
      const paymentResponse = await supabase.functions.invoke('asaas-payments-complete', {
        body: {
          reservationId,
          value: total,
          description: `Raffle ${raffleId} — ${quantity} tickets`,
          customer: {
            customer_name: name,
            customer_phone: mobilePhone,
            customer_cpf: docRaw || null
          }
        }
      });

      if (paymentResponse.error) {
        console.error('[Checkout] Payment error:', paymentResponse.error);
        const errorMsg = paymentResponse.error.message || 'Erro ao criar pagamento';
        const whereMarker = paymentResponse.data?._where ? ` (${paymentResponse.data._where})` : '';
        throw new Error(errorMsg + whereMarker);
      }

      const response = paymentResponse.data;
      if (!response.ok) {
        const errorMsg = response.error || 'Erro no pagamento';
        const whereMarker = response._where ? ` (${response._where})` : '';
        throw new Error(errorMsg + whereMarker);
      }

      console.log('[Checkout] PIX payment created successfully');
      const resId = response.reservationId || response.paymentId || response.payment_id;
      setPaymentId(resId);
      setLocalPaymentId(resId);
      setPixQrId(response.pixQrCodeId || '');
      
      setPixData({
        encodedImage: response.qrCode || response.qr?.encodedImage,
        payload: response.payload || response.qr?.payload,
        expirationDate: response.expiresAt || response.qr?.expiresAt
      });
      setStep('payment');

    } catch (error) {
      console.error('[Checkout] Payment initialization failed:', error);
      toast({
        title: "Erro no pagamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      onClose();
    }
  };

  const startPaymentPolling = () => {
    console.log('[Checkout] Starting payment polling...');
    setStep('waiting');
    setPolling(true);
  };

  const checkPaymentStatus = async () => {
    if (!localPaymentId) return;

    try {
      // Use payment-status with POST + fallback pixQrCodeId
      const { data: session } = await supabase.auth.getSession();
      const statusResponse = await fetch(`https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/payment-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.session?.access_token}`
        },
        body: JSON.stringify({
          reservationId: localPaymentId,
          pixQrCodeId: pixQrId || undefined,
          customer_name: null,
          customer_phone: null,
          customer_cpf: null
        })
      });

      if (statusResponse.ok) {
        const status = await statusResponse.json();
        console.log('[Checkout] Payment status:', status.status);

        if (status.status === 'PAID') {
          setPolling(false);
          onSuccess(status.paymentId || localPaymentId);
        } else if (status.status === 'OVERDUE' || status.status === 'REFUNDED') {
          setPolling(false);
          // Redirect to declined page
          window.location.href = `/pagamento/recusado/${localPaymentId}`;
        }
      }
    } catch (error) {
      console.error('[Checkout] Error checking payment status:', error);
    }
  };

  const copyPayload = async () => {
    if (!pixData?.payload) return;

    try {
      await navigator.clipboard.writeText(pixData.payload);
      toast({
        title: "Copiado!",
        description: "Código PIX copiado para a área de transferência"
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const reconcilePayment = async () => {
    if (!paymentId) return;

    try {
      console.log('[Checkout] Manually reconciling payment...');
      await supabase.functions.invoke('asaas-reconcile', {
        body: {
          providerPaymentId: paymentId
        }
      });
      
      toast({
        title: "Status atualizado",
        description: "Verificando status do pagamento..."
      });

      // Check status again
      setTimeout(() => checkPaymentStatus(), 1000);
    } catch (error) {
      console.error('[Checkout] Reconciliation failed:', error);
    }
  };

  if (!useAsaas) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagamento Indisponível</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              O sistema de pagamento Asaas não está ativo no momento.
            </p>
            <Button onClick={onClose} className="mt-4">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pagamento PIX</DialogTitle>
        </DialogHeader>

        {step === 'loading' && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Preparando pagamento...</p>
          </div>
        )}

        {step === 'payment' && pixData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border inline-block">
                <img 
                  src={pixData.encodedImage} 
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
                    {pixData.payload.substring(0, 50)}...
                  </code>
                  <Button size="sm" variant="outline" onClick={copyPayload}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <div className="font-medium">
                    R$ {(ticketPrice * quantity).toFixed(2).replace('.', ',')}
                  </div>
                </div>
                {timeLeft > 0 && (
                  <div>
                    <span className="text-muted-foreground">Expira em:</span>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeLeft}min
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={startPaymentPolling} 
                className="w-full"
              >
                Aguardar Confirmação
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open('https://www.bcb.gov.br/estabilidadefinanceira/pix', '_blank')}
                className="w-full"
              >
                Abrir no app do banco
              </Button>
            </div>
          </div>
        )}

        {step === 'waiting' && (
          <div className="text-center py-8 space-y-4">
            <div className="animate-pulse">
              <CheckCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            </div>
            <div>
              <p className="font-medium">Aguardando pagamento...</p>
              <p className="text-sm text-muted-foreground">
                Verificando automaticamente a cada 3 segundos
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={reconcilePayment}
              className="mt-4"
            >
              Recarregar status agora
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}