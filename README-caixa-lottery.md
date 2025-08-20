# CAIXA Lottery Integration - Complete Setup & Testing Guide

## Overview
Complete end-to-end implementation of CAIXA lottery data integration with Supabase Edge Functions, database storage, and frontend display.

## Backend Architecture

### 1. Supabase Edge Functions

#### Function: `caixa-probe`
- **Purpose**: Tests connectivity to CAIXA API
- **Endpoint**: `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-probe`
- **Method**: GET
- **Returns**: Connection status and API response preview

#### Function: `caixa-next`
- **Purpose**: Fetches upcoming lottery draws and stores in `lottery_next_draws`
- **Endpoint**: `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next`
- **Method**: POST
- **Action**: UPSERT into `public.lottery_next_draws`

#### Function: `federal-sync`
- **Purpose**: Fetches Federal lottery results and stores in `federal_draws`
- **Endpoint**: `https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync`
- **Method**: POST
- **Action**: UPSERT into `public.federal_draws`

### 2. Database Schema

#### Table: `lottery_next_draws`
```sql
- id: bigint (primary key)
- game_slug: text (not null)
- game_name: text (not null)
- next_date: date
- next_time: time
- source_url: text
- raw: jsonb
- updated_at: timestamp with time zone
```

#### Table: `federal_draws`
```sql
- id: bigint (primary key)
- concurso_number: text (not null)
- draw_date: date (not null)
- first_prize: text
- prizes: jsonb (not null, default '[]')
- source_url: text
- raw: jsonb
- created_at: timestamp with time zone
- updated_at: timestamp with time zone
```

### 3. Row Level Security (RLS)
Both tables have RLS enabled with policies:
- **SELECT**: Allow anonymous and authenticated users to read
- **INSERT/UPDATE/DELETE**: Only service role (edge functions)

## Frontend Implementation

### 1. Homepage - CaixaLotterySection Component
- Location: `src/components/CaixaLotterySection.tsx`
- **Data Source**: `supabase.from('lottery_next_draws')`
- **Features**:
  - Displays upcoming lottery draws with dates/times
  - Fallback to sample data if no real data available
  - "Últimos Números (Ganhadores)" button linking to `/resultados`
  - Official CAIXA logo and link

### 2. Results Page - Resultados Component
- Location: `src/pages/Resultados.tsx`
- **Data Sources**: 
  - `lottery_results` (Ganhavel winners)
  - `federal_draws` (Official Federal lottery results)
  - `raffles_public_money_ext` (Complete/almost complete raffles)
- **Features**:
  - Four tabs: Premiados, Loteria Federal, Rifas Completas, Quase Completas
  - Real-time updates every 30 seconds
  - Official verification indicators

## Deployment & Testing

### 1. Deploy Functions
```bash
# Deploy all three functions
supabase functions deploy caixa-probe
supabase functions deploy caixa-next  
supabase functions deploy federal-sync
```

### 2. Test API Connectivity
```bash
# Test probe (checks CAIXA API accessibility)
curl -s https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-probe | jq .

# Expected: 200 status with JSON response showing CAIXA API data
# If 403: CAIXA is blocking your region/IP
```

### 3. Populate Database
```bash
# Fetch and store next draws
curl -s -X POST https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next | jq .

# Fetch and store federal results  
curl -s -X POST https://whqxpuyjxoiufzhvqneg.functions.supabase.co/federal-sync | jq .

# Expected: JSON with sourceUrl, count, and results array
```

### 4. Verify Database Data
```sql
-- Check next draws data
SELECT game_slug, game_name, next_date, next_time 
FROM lottery_next_draws 
ORDER BY game_slug;

-- Check federal draws data
SELECT concurso_number, draw_date, first_prize, 
       jsonb_array_length(prizes) as prize_count
FROM federal_draws 
ORDER BY draw_date DESC, concurso_number DESC 
LIMIT 5;
```

### 5. Load Testing

#### Using curl (basic test)
```bash
# Test multiple rapid requests
for i in {1..10}; do
  curl -s -X POST https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next &
done
wait
```

#### Using hey (recommended)
```bash
# Install hey: go install github.com/rakyll/hey@latest

# Load test caixa-next function
hey -n 100 -c 10 -m POST https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next

# Load test PostgREST endpoint
hey -n 100 -c 10 -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo" \
    "https://whqxpuyjxoiufzhvqneg.supabase.co/rest/v1/lottery_next_draws?select=*"
```

#### Using k6 (advanced)
```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '20s', target: 0 },
  ],
};

export default function() {
  let response = http.post('https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 5000ms': (r) => r.timings.duration < 5000,
  });
}
```

```bash
# Run k6 test
k6 run load-test.js
```

## Environment Variables Required

### Edge Functions Secrets (already configured)
- `SUPABASE_URL`: https://whqxpuyjxoiufzhvqneg.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: [configured in Supabase Dashboard]

## Configuration Files

### supabase/config.toml
```toml
project_id = "whqxpuyjxoiufzhvqneg"

[functions.caixa-probe]
verify_jwt = false

[functions.caixa-next]
verify_jwt = false

[functions.federal-sync]
verify_jwt = false
```

## Troubleshooting

### 1. 403 Errors from CAIXA API
- CAIXA blocks certain cloud IPs/regions
- Consider using a Brazilian proxy service
- Alternative: Use paid APIs like apiloterias.com.br

### 2. Empty Database Tables
- Check function logs in Supabase dashboard
- Verify secrets are configured correctly
- Run functions manually via curl

### 3. Frontend Not Showing Data
- Check browser console for errors
- Verify RLS policies allow read access
- Confirm tables have data using SQL queries

## Monitoring & Maintenance

### 1. Automated Sync (Optional)
Set up cron jobs to run functions periodically:
```sql
-- Run every hour
SELECT cron.schedule(
  'sync-lottery-data',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://whqxpuyjxoiufzhvqneg.functions.supabase.co/caixa-next',
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  $$
);
```

### 2. Error Monitoring
- Check Edge Function logs in Supabase Dashboard
- Set up alerts for function failures
- Monitor database growth and performance

## Success Criteria ✅

- [ ] All three edge functions deploy successfully
- [ ] `caixa-probe` returns 200 status with CAIXA data
- [ ] `caixa-next` populates `lottery_next_draws` table
- [ ] `federal-sync` populates `federal_draws` table
- [ ] Homepage shows live lottery data (not hardcoded)
- [ ] `/resultados` page displays Federal lottery results
- [ ] "Últimos Números" button works and routes correctly
- [ ] Load tests pass without errors
- [ ] RLS policies allow proper access control

## Next Steps

1. **Deploy functions** using the commands above
2. **Test connectivity** with the curl commands
3. **Verify data** in Supabase SQL editor
4. **Check frontend** displays live data
5. **Run load tests** to ensure performance
6. **Set up monitoring** for production use

Total implementation time: ~30 minutes for deployment and testing.