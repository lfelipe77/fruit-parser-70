# Complete Asaas PIX Payment Flow - Detailed Schemas & Implementation

## 📋 **Complete Request/Response Payloads**

### 1. `reserve_tickets_v2` RPC

**Input Schema:**
```javascript
// Frontend call (ConfirmacaoPagamento.tsx:364-367)
await supabase.rpc('reserve_tickets_v2', {
  p_raffle_id: "uuid",     // Required
  p_qty: 5                 // Required, 1-20
});
```

**Function Signature:**
```sql
-- From migration 20250827165951 lines 13-23
CREATE OR REPLACE FUNCTION public.reserve_tickets_v2(
  p_raffle_id UUID,
  p_qty INTEGER  
)
RETURNS TABLE(
  reservation_id UUID,
  expires_at TIMESTAMPTZ,     -- now() + 15 minutes  
  unit_price NUMERIC,         -- From raffles.ticket_price
  total_amount NUMERIC,       -- unit_price * p_qty
  currency TEXT               -- Always 'BRL'
)
```

**Response Schema:**
```javascript
// Success response array
[{
  "reservation_id": "uuid",
  "expires_at": "2025-08-28T12:15:00Z",
  "unit_price": 5.00,
  "total_amount": 25.00,
  "currency": "BRL"
}]
```

**Database Changes:**
- Creates tickets with `status = 'reserved'`
- Sets `reservation_id` and `reserved_until = now() + 15 minutes`
- Uses `allocate_numbers()` for sequential ticket numbering

### 2. Frontend → `asaas-payments-complete`

**Headers (src/helpers/edge.ts:6-13):**
```javascript
{
  "Authorization": "Bearer <user_jwt>",
  "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // VITE_SUPABASE_ANON_KEY
  "Content-Type": "application/json"
}
```

**Request Body (ConfirmacaoPagamento.tsx:406-415):**
```javascript
{
  "reservationId": "uuid",
  "value": 25.00,                    // unitPrice * quantity, min 5.00
  "description": "Compra de bilhetes",
  "customer": {
    "customer_cpf": "12345678901",   // Normalized CPF, 11 digits
    "customer_name": "João Silva",   // From form or userProfile.full_name
    "customer_phone": "11999999999"  // From form or userProfile.phone
  }
}
```

**Success Response:**
```javascript
{
  "ok": true,
  "reservationId": "uuid",
  "paymentId": "asaas_payment_id",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAA...",
  "payload": "00020126580014br.gov.bcb.pix...",
  "expiresAt": "2025-08-28T12:00:00Z",
  "value": 25.00,
  "invoiceUrl": "https://api.asaas.com/invoice/..."
}
```

**Error Response:**
```javascript
{
  "ok": false,
  "error": "Documento inválido (CPF)",
  "code": "INVALID_DOCUMENT",
  "_where": "precheck"  // or "asaas"
}
```

### 3. Edge Function → Asaas API Calls

**Customer Creation Request:**
```javascript
// POST ${ASAAS_BASE}/customers
// Headers (asaas-payments-complete/index.ts:284-285)
{
  "access_token": "aact_YourAsaasApiKey",  // ASAAS_API_KEY from env
  "Content-Type": "application/json"
}

// Body (asaas-payments-complete/index.ts:299-306)
{
  "name": "João Silva",
  "cpfCnpj": "12345678901",           // Exactly 11 digits
  "personType": "FISICA",             // Always for CPF
  "email": "user@email.com",          // From user profile
  "mobilePhone": "11999999999",       // Sanitized BR phone
  "externalReference": "user_uuid"    // User ID for linking
}
```

**Payment Creation Request:**
```javascript
// POST ${ASAAS_BASE}/payments  
// Headers: same as customer creation

// Body (asaas-payments-complete/index.ts:326-338)
{
  "customer": "cus_000005080289",     // Asaas customer ID from previous call
  "value": 25.00,
  "description": "Compra de bilhetes",
  "billingType": "PIX",
  "dueDate": "2025-08-28",           // dueDateSP() - São Paulo timezone
  "externalReference": "reservation_uuid",
  "postalService": false,
  "callback": {
    "successUrl": "https://ganhavel.com/?pix=success&reservationId=...",
    "autoRedirect": true
  }
}
```

**PIX QR Code Request:**
```javascript
// GET ${ASAAS_BASE}/payments/{paymentId}/pixQrCode
// Headers: same as above
// No body

// Response:
{
  "encodedImage": "iVBORw0KGgoAAAANSUhEUgAA...",  // Base64 image
  "payload": "00020126580014br.gov.bcb.pix...", // PIX code for copy/paste
  "expiresAt": "2025-08-28T23:59:59"
}
```

### 4. Payment Status Polling

**Request:**
```javascript
// GET /functions/v1/payment-status?reservationId=uuid&paymentId=asaas_id
// Headers: Same Authorization + apikey pattern
```

**Asaas Status Check:**
```javascript
// Internal call: GET ${ASAAS_BASE}/payments/{paymentId}
// Response checked for: j.status === "RECEIVED" || j.status === "CONFIRMED"
```

**Response Options:**
```javascript
// Still pending
{
  "status": "PENDING",
  "reservationId": "uuid", 
  "paymentId": "asaas_payment_id",
  "asaasStatus": "PENDING"
}

// Payment confirmed
{
  "status": "PAID",
  "reservationId": "uuid",
  "paymentId": "asaas_payment_id"
}

// Not found/error
{
  "status": "UNKNOWN", 
  "reservationId": "uuid",
  "paymentId": null,
  "reason": "not_owner"
}
```

### 5. `finalize_paid_purchase` RPC

**Input Schema:**
```javascript
// Called by payment-status edge function (lines 160-166)
await admin.rpc("finalize_paid_purchase", {
  p_reservation_id: "uuid",
  p_asaas_payment_id: "asaas_payment_id", 
  p_customer_name: null,     // Optional
  p_customer_phone: null,    // Optional
  p_customer_cpf: null       // Optional
});
```

**Function Logic (migration 20250827211759):**
- **Advisory Lock**: `pg_advisory_xact_lock()` prevents duplicate processing
- **Idempotency**: Returns existing transaction if already finalized
- **Status Transition**: `tickets.status` from `'reserved'` → `'paid'`
- **Transaction Creation**: Inserts into `transactions` table

**Response Schema:**
```javascript
{
  "ok": true,
  "transaction_id": "uuid",
  "idempotent": true,        // If already processed
  "tickets_updated": 5
}

// Or error:
{
  "ok": false,
  "error": "reservation_not_found_or_expired"
}
```

## 🗄️ **Database Schema Details**

### Core Tables Schema

#### `tickets` Table
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
raffle_id         UUID NOT NULL REFERENCES raffles(id)
user_id           UUID NOT NULL  -- References auth.users
reservation_id    UUID NULL       -- Links to reservation
ticket_number     BIGINT NOT NULL -- Sequential number 
status            TEXT DEFAULT 'reserved'  -- 'reserved' → 'paid'
reserved_until    TIMESTAMPTZ     -- Expiry for reservations
created_at        TIMESTAMPTZ DEFAULT now()
```

#### `payments_pending` Table  
```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
reservation_id    UUID NOT NULL UNIQUE
asaas_payment_id  TEXT NOT NULL    -- Links to Asaas payment
amount            NUMERIC NOT NULL
status            TEXT DEFAULT 'PENDING'  -- 'PENDING' → 'PAID'
expires_at        TIMESTAMPTZ NOT NULL
created_at        TIMESTAMPTZ DEFAULT now()
updated_at        TIMESTAMPTZ DEFAULT now()
```

#### `transactions` Table (Final Records)
```sql
id                   UUID PRIMARY KEY DEFAULT gen_random_uuid()
raffle_id            UUID NOT NULL REFERENCES raffles(id)
user_id              UUID NOT NULL    -- Transaction owner
buyer_user_id        UUID NOT NULL    -- Purchaser (usually same as user_id)
amount               NUMERIC NOT NULL 
status               TEXT DEFAULT 'paid'
provider             TEXT DEFAULT 'asaas'
provider_payment_id  TEXT            -- Asaas payment ID
numbers              JSONB           -- Purchased ticket numbers array
customer_name        TEXT            -- From finalize_paid_purchase params
customer_phone       TEXT            -- From finalize_paid_purchase params  
customer_cpf         TEXT            -- From finalize_paid_purchase params
reservation_id       UUID            -- Links back to original reservation
created_at           TIMESTAMPTZ DEFAULT now()
```

#### `raffles` Table (Referenced Fields)
```sql
id             UUID PRIMARY KEY
title          TEXT
ticket_price   NUMERIC        -- Used for unit_price calculations
total_tickets  INTEGER        -- Max tickets available
status         TEXT           -- 'active', 'completed', etc.
user_id        UUID NOT NULL  -- Raffle creator
published      BOOLEAN DEFAULT false  -- Must be true for reservations
```

## 🔐 **Authentication & Headers**

### Environment Variables Used
```javascript
// Edge Functions (Deno.env.get())
SUPABASE_URL               // Project URL  
SUPABASE_ANON_KEY         // Public API key
SUPABASE_SERVICE_ROLE_KEY // Admin access for RPC calls
ASAAS_API_KEY             // "aact_YourKey" (prod) or "aact_hmlg_" (sandbox)
ASAAS_BASE                // API base URL (defaults to https://api.asaas.com/v3)
MIN_PIX_VALUE             // Minimum payment amount (default: 5)
APP_BASE_URL              // For callback URLs (default: https://ganhavel.com)

// Frontend (import.meta.env)
VITE_SUPABASE_URL         // Same as SUPABASE_URL
VITE_SUPABASE_ANON_KEY    // Same as SUPABASE_ANON_KEY  
VITE_SUPABASE_EDGE_URL    // Optional edge function override
VITE_PIX_VALIDATE         // 'strict' or 'loose' CPF validation
```

### Header Patterns
```javascript
// Frontend → Edge Function (src/helpers/edge.ts)
{
  "Authorization": "Bearer " + session.access_token,  // User JWT from Supabase Auth
  "apikey": VITE_SUPABASE_ANON_KEY,                  // Required by Supabase gateway
  "Content-Type": "application/json"
}

// Edge Function → Asaas API  
{
  "access_token": ASAAS_API_KEY,                     // Asaas authentication
  "Content-Type": "application/json"
}

// Edge Function → Supabase (Internal)
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);  // Bypasses RLS
const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${jwt}` } }             // RLS enforced
});
```

## 🔍 **CPF Validation Implementation**

### Validation Logic (src/lib/cpf.ts:10-37)
```typescript
export function isValidCPF(raw: string): boolean {
  const cpf = onlyDigits(raw);           // Remove non-digits
  
  if (cpf.length !== 11) return false;   // Must be exactly 11 digits
  if (/^(\d)\1{10}$/.test(cpf)) return false;  // Reject repeated digits (111.111.111-11)
  
  // Check digit validation algorithm
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let firstDigit = (sum * 10) % 11;
  if (firstDigit === 10) firstDigit = 0;
  if (firstDigit !== parseInt(cpf[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);  
  }
  let secondDigit = (sum * 10) % 11;
  if (secondDigit === 10) secondDigit = 0;
  if (secondDigit !== parseInt(cpf[10])) return false;
  
  return true;
}
```

### Field Mapping Flow
```javascript
// 1. Frontend input (ConfirmacaoPagamento.tsx:378)
const cpfInput = formData.cpf || userProfile?.tax_id || '';

// 2. Normalization (ConfirmacaoPagamento.tsx:382)  
const normalizedCPF = normalizeCPFForAsaas(cpfInput);  // Throws if invalid

// 3. Edge function resolution (asaas-payments-complete/index.ts:234-242)
const { customer_cpf } = payload?.customer ?? {};
const result = resolveCpfCnpj({
  profileTaxId: profile?.tax_id,    // From user_profiles.tax_id
  formDoc: customer_cpf,            // From request payload
  validateMode: 'strict'            // Or 'loose' via query param
});

// 4. Asaas API field (asaas-payments-complete/index.ts:299)
{
  "cpfCnpj": "12345678901"          // Exactly 11 digits, no formatting
}
```

### Valid Test CPFs (src/lib/cpf.ts:58-62)
```javascript
export const VALID_SANDBOX_CPFS = [
  '52998224725',  // Valid for testing
  '15350946056',  // Valid for testing
  '11144477735'   // Valid for testing  
];
```

## ⚠️ **Error Flows & Status Transitions**

### Error Response Patterns
```javascript
// CPF Validation Error (src/lib/cpf.ts:43)
{
  "ok": false,
  "error": "CPF inválido. Verifique e tente novamente.",
  "code": "VALIDATION_ERROR", 
  "_where": "precheck"
}

// Asaas API Error (asaas-payments-complete/index.ts:346)
{
  "ok": false,
  "error": "Não há nenhuma chave Pix disponível para esta conta",
  "_where": "asaas"
}

// Minimum Value Error (asaas-payments-complete/index.ts:219)
{
  "error": "Valor mínimo para PIX é R$ 5.00."
}

// Auth Error (payment-status/index.ts:28)
{
  "error": "Missing Authorization Bearer token"
}

// Ownership Error (payment-status/index.ts:93)
{
  "status": "UNKNOWN",
  "reason": "not_owner"
}
```

### Status Transition Matrix
```javascript
// 1. Initial State
tickets.status = 'reserved'
tickets.reserved_until = now() + 15 minutes
payments_pending.status = 'PENDING'

// 2. Payment Success (payment-status detects RECEIVED/CONFIRMED)
→ finalize_paid_purchase() called
→ tickets.status = 'paid' 
→ transactions table INSERT with status = 'paid'
→ payments_pending.status remains (not updated)

// 3. Expiration (if no payment)
→ tickets.reserved_until < now()
→ reserve_tickets_v2 can reuse expired ticket numbers
→ No automatic cleanup (handled by next reservation)

// 4. Error States
→ Asaas rejects payment: No DB changes, error returned to frontend
→ Duplicate finalization: Advisory lock + idempotency check prevents duplicates
→ Polling timeout: Frontend shows error, reservations expire naturally
```

### Database Cleanup Logic
- **Reservations**: Expire after 15 minutes (`reserved_until`)
- **Payments Pending**: No automatic cleanup (manual admin action needed)
- **Transactions**: Permanent record, never deleted
- **Ticket Reuse**: `allocate_numbers()` handles number assignment, can reuse expired tickets

## 🔄 **Complete Step-by-Step Flow with Line Numbers**

### Step 1: User Initiates Payment
```javascript
// ConfirmacaoPagamento.tsx:364-367
const { data: r1, error: e1 } = await supabase.rpc('reserve_tickets_v2', {
  p_raffle_id: id,
  p_qty: safeQty,
});
```

### Step 2: Edge Function Processing  
```javascript
// ConfirmacaoPagamento.tsx:403-416
const res = await fetch(`${EDGE}/functions/v1/asaas-payments-complete`, {
  method: 'POST',
  headers: edgeHeaders(session!.access_token),
  body: JSON.stringify({ 
    reservationId: reservation_id, 
    value: Number(value), 
    description: 'Compra de bilhetes',
    customer: { customer_cpf: normalizedCPF, ... }
  }),
});
```

### Step 3: Asaas API Interaction
```javascript  
// asaas-payments-complete/index.ts:339
const pay = await asaasCall('/payments', { 
  method:'POST', 
  body: JSON.stringify(payBody) 
});

// asaas-payments-complete/index.ts:354
const qr = await asaasCall(`/payments/${payment_id}/pixQrCode`, { method:'GET' });
```

### Step 4: Status Monitoring
```javascript
// ConfirmacaoPagamento.tsx:252-320 (polling every 10 seconds)
const checkStatus = await fetch(`${EDGE}/functions/v1/payment-status?reservationId=${reservationId}`);

// payment-status/index.ts:144
const paid = resp.ok && j && (j.status === "RECEIVED" || j.status === "CONFIRMED");
```

### Step 5: Transaction Finalization
```javascript
// payment-status/index.ts:160-166
await admin.rpc("finalize_paid_purchase", {
  p_reservation_id: reservationId,
  p_asaas_payment_id: pending.asaas_payment_id,
  // ...
});
```

This completes the comprehensive schema and implementation documentation for the Asaas PIX payment flow.