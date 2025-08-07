import { useEffect } from 'react';
import { useAuditLogger } from '@/hooks/useAuditLogger';

interface PaymentAuditLoggerProps {
  paymentData: {
    id?: string;
    amount: number;
    method: string;
    status: 'pending' | 'completed' | 'failed';
    raffleId?: string;
    ticketCount?: number;
    pixKey?: string;
  };
}

export const PaymentAuditLogger = ({ paymentData }: PaymentAuditLoggerProps) => {
  const { logPayment } = useAuditLogger();

  useEffect(() => {
    // Log payment events based on status changes
    if (paymentData.status === 'pending') {
      logPayment('payment_initiated', {
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.id,
        pixKey: paymentData.pixKey,
        raffleId: paymentData.raffleId,
        ticketCount: paymentData.ticketCount
      });
    } else if (paymentData.status === 'completed') {
      logPayment('payment_completed', {
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.id,
        raffleId: paymentData.raffleId,
        ticketCount: paymentData.ticketCount
      });
    } else if (paymentData.status === 'failed') {
      logPayment('payment_failed', {
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.id,
        raffleId: paymentData.raffleId,
        ticketCount: paymentData.ticketCount
      });
    }
  }, [paymentData.status, paymentData.id, logPayment]);

  // This component doesn't render anything, it's just for side effects
  return null;
};

// Hook to easily integrate payment logging into payment flows
export const usePaymentLogger = () => {
  const { logPayment, logEvent } = useAuditLogger();

  const logTicketPurchase = (purchaseData: {
    raffleId: string;
    ticketCount: number;
    totalAmount: number;
    paymentMethod: string;
    transactionId?: string;
  }) => {
    logEvent('ticket_purchase', {
      raffle_id: purchaseData.raffleId,
      ticket_count: purchaseData.ticketCount,
      total_amount: purchaseData.totalAmount,
      payment_method: purchaseData.paymentMethod,
      transaction_id: purchaseData.transactionId
    });
  };

  const logPixPayment = (pixData: {
    amount: number;
    pixKey: string;
    transactionId: string;
    raffleId: string;
  }) => {
    logEvent('pix_payment_created', {
      amount: pixData.amount,
      pix_key: pixData.pixKey, // Will be automatically masked
      transaction_id: pixData.transactionId, // Will be automatically masked
      raffle_id: pixData.raffleId
    });
  };

  const logRefund = (refundData: {
    originalTransactionId: string;
    refundAmount: number;
    reason: string;
    raffleId?: string;
  }) => {
    logEvent('payment_refund', {
      original_transaction_id: refundData.originalTransactionId,
      refund_amount: refundData.refundAmount,
      reason: refundData.reason,
      raffle_id: refundData.raffleId
    });
  };

  return {
    logPayment,
    logTicketPurchase,
    logPixPayment,
    logRefund
  };
};