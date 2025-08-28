# Payment Documentation

This directory contains comprehensive documentation for the Ganhavel payment system with Asaas PIX integration.

## Files

- **`asaas-flow.md`** - Complete technical specification of the PIX payment flow with code references
- **`asaas-sequence.mmd`** - Mermaid sequence diagram showing the payment flow
- **`asaas.postman_collection.json`** - Postman collection for testing all payment endpoints

## Quick Start

1. Import the Postman collection into Postman or Thunder Client
2. Set environment variables:
   - `supabase_url`: Your Supabase project URL
   - `supabase_anon_key`: Your Supabase anonymous key  
   - `user_jwt`: Authenticated user JWT token
   - `raffle_id`: ID of raffle to test with

3. Run the collection in order:
   1. Reserve Tickets → extracts `reservation_id`
   2. Create PIX Payment → extracts `payment_id` and QR code
   3. Check Payment Status → polls until PAID
   4. Get Purchase Summary → verify finalization

## Testing CPFs

Use these valid sandbox CPFs for testing:
- `52998224725`
- `15350946056` 
- `11144477735`

## Environment Setup

For development testing, set:
```bash
VITE_PIX_VALIDATE=loose  # Allows test CPFs
```

For production:
```bash  
VITE_PIX_VALIDATE=strict # Enforces real CPF validation
```