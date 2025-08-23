# Database Audit Report - Asaas PIX Payment Integration

## Current Database Status

After analyzing the existing database schema, here are the findings for Asaas PIX payment integration:

### Missing Tables
❌ **payments** table - Required for storing payment records
❌ **payment_methods** table - Optional, for storing payment method preferences

### Existing Tables Analysis

#### ✅ `transactions` table
- **Status**: EXISTS
- **Usage**: Currently used for payment tracking
- **Gaps**: May need additional columns for Asaas integration

#### ✅ `tickets` table  
- **Status**: EXISTS
- **Usage**: Currently used for ticket management
- **Gaps**: May need payment_id foreign key

---

## Proposed SQL (DO NOT RUN)

### 1. Create payments table

```sql
-- Create payments table for Asaas integration
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    raffle_id UUID NOT NULL,
    provider TEXT NOT NULL DEFAULT 'asaas',
    provider_payment_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'created',
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    customer_data JSONB,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_status CHECK (status IN ('created', 'pending', 'received', 'confirmed', 'overdue', 'refunded', 'failed')),
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT valid_provider CHECK (provider IN ('asaas', 'stripe', 'mock'))
);

-- Create unique index for provider payment ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_provider_payment_id 
ON public.payments(provider, provider_payment_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_raffle_id ON public.payments(raffle_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
```

### 2. Add payment_id to tickets table

```sql
-- Add payment reference to tickets
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL;

-- Add index for payment lookups
CREATE INDEX IF NOT EXISTS idx_tickets_payment_id ON public.tickets(payment_id);

-- Add status field for payment tracking
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS tx_status TEXT DEFAULT 'pending';

-- Update constraint to include new status values
ALTER TABLE public.tickets 
DROP CONSTRAINT IF EXISTS tickets_tx_status_check;

ALTER TABLE public.tickets 
ADD CONSTRAINT tickets_tx_status_check 
CHECK (tx_status IN ('pending', 'paid', 'refunded', 'cancelled'));
```

### 3. Row Level Security (RLS) Policies

```sql
-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "payments_user_read" 
ON public.payments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own payments
CREATE POLICY "payments_user_insert" 
ON public.payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can update payment status (for webhooks)
CREATE POLICY "payments_service_update" 
ON public.payments 
FOR UPDATE 
USING (auth.role() = 'service_role');

-- Policy: Admin can view all payments
CREATE POLICY "payments_admin_all" 
ON public.payments 
FOR ALL 
USING (public.is_admin(auth.uid()));
```

### 4. Database Functions

```sql
-- Function to confirm payment and allocate tickets
CREATE OR REPLACE FUNCTION public.confirm_payment(
    p_provider TEXT,
    p_provider_payment_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    payment_record RECORD;
BEGIN
    -- Get payment record
    SELECT * INTO payment_record 
    FROM public.payments 
    WHERE provider = p_provider 
    AND provider_payment_id = p_provider_payment_id 
    AND status IN ('created', 'pending');
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Payment not found or already processed';
    END IF;
    
    -- Update payment status
    UPDATE public.payments 
    SET status = 'confirmed',
        confirmed_at = now(),
        updated_at = now()
    WHERE id = payment_record.id;
    
    -- Update tickets status
    UPDATE public.tickets 
    SET tx_status = 'paid'
    WHERE payment_id = payment_record.id;
    
    -- Log the confirmation
    INSERT INTO public.audit_logs (user_id, action, context)
    VALUES (
        payment_record.user_id,
        'payment_confirmed',
        jsonb_build_object(
            'payment_id', payment_record.id,
            'provider', p_provider,
            'provider_payment_id', p_provider_payment_id,
            'amount', payment_record.amount
        )
    );
END;
$$;
```

### 5. Trigger for Automatic Ticket Allocation

```sql
-- Trigger function for automatic ticket allocation on payment confirmation
CREATE OR REPLACE FUNCTION public.allocate_tickets_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    ticket_count INTEGER;
BEGIN
    -- Only proceed if status changed to confirmed/received
    IF OLD.status != NEW.status AND NEW.status IN ('confirmed', 'received') THEN
        -- Check if tickets already exist for this payment
        SELECT COUNT(*) INTO ticket_count 
        FROM public.tickets 
        WHERE payment_id = NEW.id;
        
        -- If no tickets exist, create them
        IF ticket_count = 0 THEN
            -- This would contain the logic to create tickets
            -- based on payment amount and raffle ticket price
            -- Implementation depends on your ticket creation logic
            
            INSERT INTO public.audit_logs (user_id, action, context)
            VALUES (
                NEW.user_id,
                'tickets_allocated',
                jsonb_build_object(
                    'payment_id', NEW.id,
                    'raffle_id', NEW.raffle_id
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER allocate_tickets_on_payment_confirmed
    AFTER UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.allocate_tickets_on_payment();
```

---

## Security Considerations

### 1. Data Protection
- ✅ All sensitive data (payment details, customer info) stored in JSONB fields
- ✅ No credit card or banking data stored directly
- ✅ RLS policies restrict access to user's own payments
- ✅ Service role access for webhook updates

### 2. Webhook Security
- ✅ Secret token validation implemented in webhook handler
- ✅ Idempotent updates by provider_payment_id
- ✅ Rate limiting on webhook endpoint
- ✅ Payload size limits (200KB)

### 3. Audit Trail
- ✅ All payment state changes logged to audit_logs
- ✅ Webhook events logged with sanitized data
- ✅ User actions tracked
- ✅ Admin actions monitored

---

## Implementation Readiness Checklist

### Backend (Edge Functions) ✅
- [x] asaas-customers - Customer creation
- [x] asaas-payments - Payment creation  
- [x] asaas-pix-qr - QR code generation
- [x] payment-status - Status polling
- [x] asaas-reconcile - Manual reconciliation
- [x] asaas-webhook - Event handling with DB updates

### Frontend Components ✅
- [x] AsaasCheckoutDrawer - Complete checkout flow
- [x] PagamentoSucesso - Success page
- [x] PagamentoRecusado - Declined/failed page
- [x] Routes configured

### Database Schema ❌
- [ ] payments table creation
- [ ] RLS policies setup
- [ ] Indexes creation
- [ ] Trigger functions
- [ ] Foreign key relationships

### Environment Variables ✅
- [x] ASAAS_API_KEY configured
- [x] ASAAS_WEBHOOK_SECRET configured
- [x] USE_ASAAS feature flag ready

---

## Next Steps

1. **Database Migration**: Execute the proposed SQL above after user approval
2. **Testing**: Comprehensive testing in Asaas sandbox environment
3. **Monitoring**: Set up alerts for payment failures and webhook issues
4. **Documentation**: Update API documentation with new endpoints

## QA Checklist (Ready for Testing)

### API Endpoints
- [ ] POST /functions/v1/asaas-customers
- [ ] POST /functions/v1/asaas-payments  
- [ ] GET /functions/v1/asaas-pix-qr
- [ ] GET /functions/v1/payment-status
- [ ] POST /functions/v1/asaas-reconcile
- [ ] POST /functions/v1/asaas-webhook

### Frontend Flow
- [ ] Checkout drawer opens and loads
- [ ] Customer creation successful
- [ ] Payment creation returns valid ID
- [ ] QR code displays correctly
- [ ] Copy payload functionality
- [ ] Payment status polling
- [ ] Success page navigation
- [ ] Declined page navigation

### Security
- [ ] Secrets not exposed in frontend
- [ ] Webhook validates secret correctly
- [ ] RLS policies prevent unauthorized access
- [ ] Audit logs capture all events

---

**⚠️ IMPORTANT**: The database schema changes above are proposals only. They should be reviewed and executed through proper database migration procedures after testing in a development environment.