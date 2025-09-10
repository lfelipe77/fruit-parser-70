import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuditLogContext {
  [key: string]: any;
}

export type AuditAction =
  // Authentication events
  | 'user_signup'
  | 'user_login_success'
  | 'user_login_failed'
  | 'user_logout'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verification'
  
  // Payment events (masked)
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'payment_refund'
  | 'pix_payment_created'
  | 'ticket_purchase'
  
  // Admin actions
  | 'user_banned'
  | 'user_unbanned'
  | 'role_promoted'
  | 'role_demoted'
  | 'raffle_approved'
  | 'raffle_rejected'
  | 'raffle_suspended'
  | 'raffle_reactivated'
  | 'raffle_highlighted'
  | 'raffle_unhighlighted'
  | 'ticket_resolved'
  | 'ticket_escalated'
  | 'security_alert_investigated'
  | 'security_alert_resolved'
  | 'admin_settings_changed'
  | 'bulk_action_performed'
  
  // Content moderation
  | 'content_moderated'
  | 'user_warned'
  | 'report_filed'
  | 'report_resolved'
  
  // System events
  | 'data_export_requested'
  | 'backup_created'
  | 'system_maintenance'
  | 'api_rate_limit_exceeded';

export const useAuditLogger = () => {
  const logEvent = async (
    action: AuditAction,
    context: AuditLogContext = {},
    userId?: string
  ) => {
    try {
      // Automatically mask sensitive data
      const sanitizedContext = maskSensitiveData(context);
      
      // Add common metadata
      const enrichedContext = {
        ...sanitizedContext,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        page: window.location.pathname,
        referrer: document.referrer || null,
        ip_address: null, // Will be populated by edge function if needed
      };

      // Use JSON wrapper to include actor_id when available
      const { data: authUser } = await supabase.auth.getUser();
      const actorId = userId || authUser?.user?.id || null;
      if (userId || authUser?.user) {
        await supabase.rpc('log_audit_event_json', {
          payload: {
            action,
            context: enrichedContext,
            actor_id: actorId
          }
        });
      } else {
        // For unauthenticated events, call edge function directly with 4s timeout (fire-and-forget)
        setTimeout(async () => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout
            
            try {
              await supabase.functions.invoke('audit-logger', {
                body: {
                  action,
                  context: enrichedContext,
                  user_id: userId
                }
              });
            } finally {
              clearTimeout(timeoutId);
            }
          } catch (error) {
            console.warn('Audit log failed (non-blocking):', error);
          }
        }, 0);
      }
    } catch (error) {
      console.error('Failed to log audit event:', action, error);
      // Don't show user-facing errors for audit logging failures
      // Don't throw the error to prevent blocking the app
    }
  };

  // Authentication event helpers
  const logLogin = (method: 'email' | 'google', success: boolean, email?: string) => {
    const action = success ? 'user_login_success' : 'user_login_failed';
    logEvent(action, {
      login_method: method,
      email: email ? maskEmail(email) : null,
      success
    });
  };

  const logSignup = (email: string, method: 'email' | 'google') => {
    logEvent('user_signup', {
      email: maskEmail(email),
      signup_method: method
    });
  };

  const logLogout = () => {
    logEvent('user_logout');
  };

  // Payment event helpers (with data masking)
  const logPayment = (
    action: Extract<AuditAction, 'payment_initiated' | 'payment_completed' | 'payment_failed'>,
    paymentData: {
      amount?: number;
      method?: string;
      transactionId?: string;
      pixKey?: string;
      raffleId?: string;
      ticketCount?: number;
    }
  ) => {
    logEvent(action, {
      amount: paymentData.amount,
      payment_method: paymentData.method,
      transaction_id: paymentData.transactionId ? maskTransactionId(paymentData.transactionId) : null,
      pix_key: paymentData.pixKey ? maskPixKey(paymentData.pixKey) : null,
      raffle_id: paymentData.raffleId,
      ticket_count: paymentData.ticketCount,
      payment_provider: 'masked_for_security'
    });
  };

  // Admin action helpers (flexible to accept any audit action)
  const logAdminAction = (
    action: AuditAction | string, // Allow any string for flexibility
    context: Record<string, any> = {}
  ) => {
    logEvent(action as AuditAction, {
      admin_action: true,
      ...context
    });
  };

  // Bulk action helper
  const logBulkAction = (
    actionType: string,
    affectedIds: string[],
    reason?: string
  ) => {
    logEvent('bulk_action_performed', {
      action_type: actionType,
      affected_count: affectedIds.length,
      affected_ids: affectedIds.slice(0, 10), // Only log first 10 IDs
      reason,
      bulk_operation: true
    });
  };

  return {
    logEvent,
    logLogin,
    logSignup,
    logLogout,
    logPayment,
    logAdminAction,
    logBulkAction
  };
};

// Data masking utilities
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 2 
    ? `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`
    : '*'.repeat(local.length);
  return `${maskedLocal}@${domain}`;
};

const maskPixKey = (pixKey: string): string => {
  // Mask PIX keys (can be email, phone, CPF, or random key)
  if (pixKey.includes('@')) {
    return maskEmail(pixKey);
  } else if (pixKey.match(/^\d+$/)) {
    // Phone or CPF - show only first 2 and last 2 digits
    return pixKey.length > 4 
      ? `${pixKey.slice(0, 2)}${'*'.repeat(pixKey.length - 4)}${pixKey.slice(-2)}`
      : '*'.repeat(pixKey.length);
  } else {
    // Random key - show only first 4 and last 4 characters
    return pixKey.length > 8
      ? `${pixKey.slice(0, 4)}${'*'.repeat(pixKey.length - 8)}${pixKey.slice(-4)}`
      : '*'.repeat(pixKey.length);
  }
};

const maskTransactionId = (transactionId: string): string => {
  return transactionId.length > 8
    ? `${transactionId.slice(0, 4)}${'*'.repeat(transactionId.length - 8)}${transactionId.slice(-4)}`
    : '*'.repeat(transactionId.length);
};

const maskSensitiveData = (context: AuditLogContext): AuditLogContext => {
  const sensitiveKeys = [
    'password', 'senha', 'token', 'secret', 'key', 'cpf', 'rg', 
    'credit_card', 'card_number', 'cvv', 'api_key', 'private_key'
  ];

  const maskedContext = { ...context };

  for (const key of Object.keys(maskedContext)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      maskedContext[key] = '[MASKED]';
    } else if (typeof maskedContext[key] === 'string') {
      // Mask anything that looks like an ID document
      if (maskedContext[key].match(/^\d{11}$/) || maskedContext[key].match(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)) {
        maskedContext[key] = '[MASKED_DOCUMENT]';
      }
    }
  }

  return maskedContext;
};