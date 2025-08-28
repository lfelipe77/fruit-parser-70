# Asaas PIX Payment Flow - Complete Documentation

## Overview

This document provides a comprehensive analysis of the PIX payment flow implementation in Ganhavel, extracted directly from the codebase. The flow enables users to reserve tickets for raffles and pay via PIX using the Asaas payment gateway.

## Sequence Diagram

![Asaas PIX Flow](./asaas-sequence.mmd)

## 1. Endpoints Catalog

### Frontend Components

#### 1.1 ConfirmacaoPagamento (Payment Confirmation Page)
- **File**: `src/pages/ConfirmacaoPagamento.tsx`
- **Route**: `/ganhavel/:id/confirmacao-pagamento`
- **Purpose**: Handles ticket reservation and PIX payment initiation
- **Key Functions**:
  - `onPayPix()`: Initiates PIX payment flow
  - `pollPaymentStatus()`: Polls payment status after PIX creation

#### 1.2 PagamentoSucesso (Payment Success Page)
- **File**: `src/pages/PagamentoSucesso.tsx`
- **Route**: `/ganhavel/:id/pagamento-sucesso`
- **Purpose**: Displays payment confirmation and ticket details
- **Key Functions**:
  - `fetchPaymentDetails()`: Retrieves payment and reservation data

### Supabase Edge Functions

#### 1.3 asaas-payments-complete
- **File**: `supabase/functions/asaas-payments-complete/index.ts`
- **URL**: `/functions/v1/asaas-payments-complete`
- **Method**: POST
- **Auth**: Required (Bearer JWT)
- **Purpose**: Creates PIX payment on Asaas and returns QR code

**Headers**:
```javascript
{
  "Authorization": "Bearer <user_jwt>",
  "Content-Type": "application/json",
  "apikey": "<supabase_anon_key>"
}
```

**Request Body**:
```json
{
  "reservationId": "uuid",
  "value": 25.00,
  "description": "Compra de bilhetes",
  "customer": {
    "customer_cpf": "12345678901",
    "customer_name": "João Silva",
    "customer_phone": "11999999999"
  }
}
```

**Response**:
```json
{
  "ok": true,
  "reservationId": "uuid",
  "paymentId": "asaas_payment_id",
  "qrCode": "data:image/png;base64,...",
  "payload": "00020126580014br.gov.bcb.pix...",
  "expiresAt": "2025-08-28T12:00:00Z",
  "value": 25.00,
  "invoiceUrl": "https://..."
}
```

#### 1.4 payment-status
- **File**: `supabase/functions/payment-status/index.ts`
- **URL**: `/functions/v1/payment-status`
- **Method**: GET
- **Auth**: Required (Bearer JWT)
- **Purpose**: Checks payment status at Asaas and finalizes if paid

**Query Parameters**:
- `reservationId`: UUID of the reservation
- `paymentId`: Asaas payment ID (optional)

**Response**:
```json
{
  "status": "PAID" | "PENDING" | "UNKNOWN",
  "reservationId": "uuid",
  "paymentId": "asaas_payment_id",
  "asaasStatus": "RECEIVED" | "CONFIRMED" | "PENDING"
}
```

#### 1.5 payment-finalize
- **File**: `supabase/functions/payment-finalize/index.ts`
- **URL**: `/functions/v1/payment-finalize`
- **Method**: POST
- **Auth**: Required (Bearer JWT)
- **Purpose**: Manually finalizes a paid purchase

**Request Body**:
```json
{
  "reservationId": "uuid",
  "paymentId": "asaas_payment_id",
  "name": "João Silva",
  "phone": "11999999999",
  "cpf": "12345678901"
}
```

### Database RPCs

#### 1.6 reserve_tickets_v2
- **File**: Referenced in migrations (lines 10-185 in `20250827165844_...sql`)
- **Purpose**: Reserves tickets for a raffle and creates reservation
- **Auth**: Authenticated users only

**Call**:
```javascript
const { data, error } = await supabase.rpc('reserve_tickets_v2', {
  p_raffle_id: 'uuid',
  p_qty: 5
});
```

**Returns**:
```json
[{
  "reservation_id": "uuid",
  "expires_at": "2025-08-28T12:00:00Z",
  "unit_price": 5.00,
  "total_amount": 25.00,
  "currency": "BRL"
}]
```

#### 1.7 get_reservation_audit
- **Purpose**: Gets reservation details and payment status
- **Auth**: Owner or admin only

#### 1.8 purchase_summary_by_reservation
- **File**: Referenced in migrations `20250828005342_...sql`
- **Purpose**: Gets transaction details for finalized purchase
- **Auth**: Owner or admin only

#### 1.9 finalize_paid_purchase
- **Purpose**: Converts reservation to paid transaction
- **Auth**: Service role only

### External APIs (Asaas)

#### 1.10 Asaas Customer Creation
- **URL**: `${ASAAS_BASE}/customers`
- **Method**: POST
- **Headers**: `{ "access_token": "ASAAS_API_KEY", "Content-Type": "application/json" }`

#### 1.11 Asaas Payment Creation
- **URL**: `${ASAAS_BASE}/payments`
- **Method**: POST

#### 1.12 Asaas PIX QR Code
- **URL**: `${ASAAS_BASE}/payments/{paymentId}/pixQrCode`
- **Method**: GET

#### 1.13 Asaas Payment Status
- **URL**: `${ASAAS_BASE}/payments/{paymentId}`
- **Method**: GET

## 2. End-to-End Data Flow

### Happy Path Flow:

1. **Ticket Reservation** (`ConfirmacaoPagamento.tsx:364-375`)
   - User fills form with CPF, name, phone
   - Frontend calls `reserve_tickets_v2` RPC
   - Returns `reservation_id` and ticket details

2. **PIX Payment Creation** (`ConfirmacaoPagamento.tsx:403-416`)
   - Frontend validates CPF using `normalizeCPFForAsaas()`
   - Calls `asaas-payments-complete` edge function
   - Edge function creates Asaas customer and payment
   - Returns QR code and payment details

3. **PIX QR Display** (`ConfirmacaoPagamento.tsx:435-449`)
   - Modal displays QR code image and PIX payload
   - User scans/copies PIX code to pay

4. **Payment Polling** (`ConfirmacaoPagamento.tsx:252-320`)
   - Frontend polls `payment-status` every 10 seconds
   - Edge function checks Asaas payment status
   - When status is "RECEIVED" or "CONFIRMED", calls `finalize_paid_purchase`

5. **Payment Confirmation** (`PagamentoSucesso.tsx:31-164`)
   - User redirected to success page
   - Page calls `get_reservation_audit` and `purchase_summary_by_reservation`
   - Displays transaction details and ticket numbers

## 3. Exact Payloads & Headers

### Frontend to asaas-payments-complete
```javascript
// Headers (edgeHeaders function in src/helpers/edge.ts:6-13)
{
  "Authorization": "Bearer <user_jwt>",
  "apikey": "<VITE_SUPABASE_ANON_KEY>",
  "Content-Type": "application/json"
}

// Body (ConfirmacaoPagamento.tsx:406-415)
{
  "reservationId": "uuid",
  "value": 25.00,
  "description": "Compra de bilhetes",
  "customer": {
    "customer_cpf": "12345678901",
    "customer_name": "João Silva", 
    "customer_phone": "11999999999"
  }
}
```

### Edge Function to Asaas Customer Creation
```javascript
// Headers (asaas-payments-complete/index.ts:284-285)
{
  "access_token": "<ASAAS_API_KEY>",
  "Content-Type": "application/json"
}

// Body (asaas-payments-complete/index.ts:299-306)
{
  "name": "João Silva",
  "cpfCnpj": "12345678901",
  "personType": "FISICA",
  "email": "user@email.com",
  "mobilePhone": "11999999999",
  "externalReference": "user_uuid"
}
```

### Edge Function to Asaas Payment Creation
```javascript
// Body (asaas-payments-complete/index.ts:326-338)
{
  "customer": "asaas_customer_id",
  "value": 25.00,
  "description": "Compra de bilhetes",
  "billingType": "PIX",
  "dueDate": "2025-08-28",
  "externalReference": "reservation_uuid",
  "postalService": false,
  "callback": {
    "successUrl": "https://ganhavel.com/?pix=success&reservationId=...",
    "autoRedirect": true
  }
}
```

## 4. CPF/CNPJ Handling

### Form Fields
- **Frontend Input**: `formData.cpf` (ConfirmacaoPagamento.tsx:165)
- **Profile Fallback**: `userProfile.tax_id`
- **Validation**: Uses `normalizeCPFForAsaas()` from `src/lib/cpf.ts:39-47`

### Validation Logic (src/lib/cpf.ts:10-37)
```typescript
function isValidCPF(raw: string): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  // Check digit validation algorithm
}
```

### Asaas Mapping (asaas-payments-complete/index.ts:234-242)
- Form field `customer_cpf` → Edge function `formDoc`
- Profile field `tax_id` → Edge function `profileTaxId`
- Resolved to `cpfCnpj` field in Asaas customer payload

### Valid Test CPFs (src/lib/cpf.ts:58-62)
- `52998224725`
- `15350946056`
- `11144477735`

## 5. Database Schema

### Core Tables

#### tickets
```sql
-- Key columns used in payment flow
id UUID PRIMARY KEY
raffle_id UUID NOT NULL
user_id UUID NOT NULL  
reservation_id UUID NULL
ticket_number BIGINT
status TEXT DEFAULT 'reserved'
created_at TIMESTAMPTZ DEFAULT now()
```

#### payments_pending
```sql
-- Tracks PIX payments awaiting confirmation
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
reservation_id UUID NOT NULL UNIQUE
asaas_payment_id TEXT NOT NULL
amount NUMERIC NOT NULL
status TEXT DEFAULT 'PENDING'
expires_at TIMESTAMPTZ NOT NULL
created_at TIMESTAMPTZ DEFAULT now()
```

#### transactions
```sql
-- Final payment records
id UUID PRIMARY KEY
raffle_id UUID NOT NULL
user_id UUID NOT NULL
buyer_user_id UUID NOT NULL
amount NUMERIC NOT NULL
status TEXT DEFAULT 'paid'
provider TEXT DEFAULT 'asaas'
provider_payment_id TEXT
numbers JSONB
created_at TIMESTAMPTZ DEFAULT now()
```

#### payments_verified
```sql
-- Alternative verified payments table
id UUID PRIMARY KEY
raffle_id UUID NOT NULL
buyer_user_id UUID
amount NUMERIC NOT NULL
provider TEXT DEFAULT 'external'
provider_txid TEXT
status TEXT DEFAULT 'verified'
created_at TIMESTAMPTZ DEFAULT now()
```

### Status Transitions
1. **Reserved**: `tickets.status = 'reserved'`, `reservation_id` populated
2. **Pending**: Record in `payments_pending` with `status = 'PENDING'`
3. **Paid**: Record in `transactions` with `status = 'paid'`

### RLS Policies
- Users can only access their own reservations/tickets
- Service role can write to `payments_pending` and `transactions`
- Admins can view all records

## 6. Environment Variables & Secrets

### Edge Function Variables
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Admin access to database
- `SUPABASE_ANON_KEY`: Public API key
- `ASAAS_API_KEY`: Asaas API authentication key
- `ASAAS_BASE_URL`: Asaas API base URL (production/sandbox)
- `MIN_PIX_VALUE`: Minimum PIX payment amount (default: 5)
- `APP_BASE_URL`: Application base URL for callbacks
- `ALLOWED_ORIGINS`: CORS allowed origins

### Frontend Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public API key
- `VITE_SUPABASE_EDGE_URL`: Edge functions URL (optional)
- `VITE_PIX_VALIDATE`: CPF validation mode ('strict' or 'loose')

## 7. Error Handling Matrix

| Error Source | Error Code | Message | Frontend Action |
|--------------|------------|---------|-----------------|
| CPF Validation | INVALID_DOCUMENT | "Documento inválido (CPF)" | Show form error |
| Asaas Customer | HTTP 400 | Asaas error message | Show toast with `_where: 'asaas'` |
| Asaas Payment | HTTP 400 | "Falha ao criar cobrança" | Show toast error |
| Missing PIX Key | HTTP 400 | "Não há nenhuma chave Pix disponível" | Show specific error |
| Min Value | HTTP 422 | "Valor mínimo para PIX é R$ 5.00" | Show amount error |
| Auth | HTTP 401 | "Missing Authorization Bearer token" | Redirect to login |
| RLS | HTTP 403 | "Not found or not your reservation" | Show access denied |

## 8. Webhook Implementation

**Current Status**: No webhooks implemented. Payment confirmation relies on:
1. Frontend polling via `payment-status` endpoint
2. Manual status checks at Asaas API
3. Automatic finalization when status = "RECEIVED" or "CONFIRMED"

## 9. Logging & Debugging

### Key Log Statements
- `[asaas] cpfCnpj.check` - CPF validation details
- `[asaas] customer payload (preview)` - Customer data sent to Asaas
- `[asaas] customer creation error` - Customer creation failures
- `[asaas] payment creation error` - Payment creation failures
- `[payment-status] response` - Payment status polling results
- `[payment-finalize] Purchase finalized successfully` - Successful finalization

### Debug Mode
- Enable with `?debug=1` query parameter in ConfirmacaoPagamento
- Shows debug token and reservation ID
- Available in development environment

## 10. Testing Checklist

### CPF Validation Tests
- [ ] Valid CPF: Use test CPFs (52998224725, 15350946056, 11144477735)
- [ ] Invalid CPF: Use invalid format, expect "Documento inválido" error
- [ ] Empty CPF: Should fall back to profile tax_id if available
- [ ] Loose mode: Set `VITE_PIX_VALIDATE=loose`, should accept invalid CPFs

### Payment Flow Tests  
- [ ] Successful PIX: Complete flow from reservation to PAID status
- [ ] Minimum value: Test with value < R$ 5.00, expect error
- [ ] Missing auth: Call without JWT, expect 401
- [ ] Invalid reservation: Use non-existent reservation_id, expect 403
- [ ] Asaas errors: Test with invalid API key, expect Asaas error message

### Database State Tests
- [ ] Reservation creation: Verify tickets table has reservation_id
- [ ] Payment pending: Verify payments_pending record created
- [ ] Finalization: Verify transactions table populated when paid
- [ ] Idempotency: Multiple finalization calls should not create duplicates

### Edge Cases
- [ ] Expired reservation: Test with reservation older than timeout
- [ ] Duplicate payment: Multiple payment attempts for same reservation
- [ ] Network failure: Test with Asaas API unavailable
- [ ] Malformed response: Test with invalid Asaas response format

### Security Tests
- [ ] RLS enforcement: User cannot access other users' reservations
- [ ] Input sanitization: Test with malicious JSON/SQL injection
- [ ] Rate limiting: Verify rate limiting on payment endpoints
- [ ] CORS: Verify only allowed origins can call edge functions

## cURL Examples

### Create PIX Payment
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/asaas-payments-complete" \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "reservationId": "123e4567-e89b-12d3-a456-426614174000",
    "value": 25.00,
    "description": "Compra de bilhetes",
    "customer": {
      "customer_cpf": "52998224725",
      "customer_name": "João Silva",
      "customer_phone": "11999999999"
    }
  }'
```

### Check Payment Status
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/payment-status?reservationId=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "apikey: <SUPABASE_ANON_KEY>"
```

### Reserve Tickets
```bash
curl -X POST "https://your-project.supabase.co/rest/v1/rpc/reserve_tickets_v2" \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "p_raffle_id": "123e4567-e89b-12d3-a456-426614174000",
    "p_qty": 5
  }'
```

### Manual Finalization
```bash
curl -X POST "https://your-project.supabase.co/functions/v1/payment-finalize" \
  -H "Authorization: Bearer <USER_JWT>" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "reservationId": "123e4567-e89b-12d3-a456-426614174000",
    "paymentId": "asaas_payment_id",
    "name": "João Silva",
    "phone": "11999999999",
    "cpf": "52998224725"
  }'
```

---

*This documentation is current as of the codebase commit analyzed. All file paths, line numbers, and code snippets are extracted directly from the implementation.*