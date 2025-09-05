import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transactionData: any) => void;
  paymentData: {
    provider_payment_id: string;
    amount: number;
    pix_qr_code?: string;
    pix_copy_paste?: string;
    pix_qr_base64?: string;
    reservation_id: string;
    raffle_id: string;
    qty: number;
  };
  numbers: string[][]; // exactly 5 pairs of two-digit strings
  buyer: {
    name?: string;
    phone?: string;
    email?: string;
    cpf?: string;
    address?: Record<string, unknown> | null;
  };
}

export default function PixPaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  paymentData,
  numbers,
  buyer
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

  // Copy PIX code to clipboard
  const copyPixCode = async () => {
    if (!paymentData.pix_copy_paste) return;
    
    try {
      await navigator.clipboard.writeText(paymentData.pix_copy_paste);
      setCopied(true);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu app bancário para pagar"
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente",
        variant: "destructive"
      });
    }
  };

  // Poll payment status with fallback
  useEffect(() => {
    if (!isOpen || !paymentData.provider_payment_id) return;

    let pollCount = 0;

    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`[PIX Poll] Checking payment status for ${paymentData.provider_payment_id}`);
        
        const { data, error } = await supabase
          .from("payments_pending")
          .select("status")
          .eq("asaas_payment_id", paymentData.provider_payment_id)
          .maybeSingle();

        if (error) {
          console.warn("Payment polling error:", error.message);
          return;
        }

        console.log(`[PIX Poll] Current status: ${data?.status || 'not found'}`);

        if (data?.status === "PAID") {
          console.log('[PIX Poll] Payment confirmed! Finalizing purchase...');
          setIsPolling(false);
          clearInterval(pollInterval);
          
          // Finalize the purchase to mint tickets and update raffle data
          console.log('[PIX Poll] Starting finalization with data:', {
            reservationId: paymentData.reservation_id,
            asaasPaymentId: paymentData.provider_payment_id
          });
          
          try {
            const { data: sess } = await supabase.auth.getSession();
            const jwt = sess?.session?.access_token;

            const { data: finalizeData, error: finalizeError } = await supabase.functions.invoke('finalize-payment', {
              body: {
                reservation_id: paymentData.reservation_id,
                asaas_payment_id: paymentData.provider_payment_id,
                raffle_id: paymentData.raffle_id,
                numbers,
                buyer
              },
              headers: jwt ? { Authorization: `Bearer ${jwt}` } : {}
            });

            console.log('[PIX Poll] Function response:', { finalizeData, finalizeError });

            if (finalizeError) {
              console.error('[PIX Poll] Finalization failed:', finalizeError);
              // Still navigate to success even if finalization fails - webhook will handle it
            } else {
              console.log('[PIX Poll] Purchase finalized successfully:', finalizeData);
            }
          } catch (finalizeErr) {
            console.error('[PIX Poll] Finalization exception:', finalizeErr);
          }

          onSuccess({
            transactionId: paymentData.provider_payment_id,
            amount: paymentData.amount,
            reservationId: paymentData.reservation_id
          });
          return;
        }

        // Every 3rd poll (~9s), use fallback to check Asaas directly
        if (pollCount % 3 === 0 && !data) {
          console.log(`[PIX Poll] Fallback check via payment-status function`);
          try {
            const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke('payment-status', {
              body: {
                provider: 'asaas',
                payment_id: paymentData.provider_payment_id
              }
            });

            if (!fallbackError && fallbackData?.status) {
              console.log(`[PIX Poll] Fallback status: ${fallbackData.status}`);
              // The function updates the DB if paid, so next regular poll will find it
            }
          } catch (fallbackErr) {
            console.warn('[PIX Poll] Fallback check failed:', fallbackErr);
          }
        }
      } catch (error) {
        console.warn("Payment polling unexpected error:", error);
      }
    }, 3000); // Poll every 3 seconds

    setIsPolling(true);
    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [isOpen, paymentData.provider_payment_id, onSuccess]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Pagamento PIX</h2>
            <p className="text-sm text-muted-foreground">
              Expires em {formatTime(timeLeft)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-2xl font-bold text-primary">
              R$ {paymentData.amount.toFixed(2)}
            </p>
          </div>

          {/* QR Code */}
          {(paymentData.pix_qr_base64 || paymentData.pix_qr_code) && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                {paymentData.pix_qr_base64 ? (
                  <img
                    src={`data:image/png;base64,${paymentData.pix_qr_base64}`}
                    alt="QR Code PIX - pagar com Pix"
                    width={200}
                    height={200}
                    loading="lazy"
                  />
                ) : (
                  <QRCodeSVG 
                    value={paymentData.pix_qr_code as string}
                    size={200}
                    level="M"
                  />
                )}
              </div>
            </div>
          )}

          {/* Copy & Paste Code */}
          {paymentData.pix_copy_paste && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Código PIX Copia e Cola:</p>
              <div className="relative">
                <textarea
                  value={paymentData.pix_copy_paste}
                  readOnly
                  className="w-full h-20 p-3 text-xs border rounded resize-none bg-muted"
                />
                <Button
                  onClick={copyPixCode}
                  size="sm"
                  className="absolute top-2 right-2"
                  variant={copied ? "default" : "outline"}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Como pagar:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Escaneie o código QR ou cole o código</li>
              <li>Confirme o pagamento</li>
            </ol>
          </div>

          {/* Status */}
          {isPolling && (
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Aguardando pagamento...</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}