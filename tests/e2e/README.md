# Ganhavel E2E Smoke Tests

Fast end-to-end tests to catch critical regressions in the raffle system.

## Setup

### A) Using pnpm (recommended)

1. Install Playwright browsers:
```bash
pnpm dlx playwright install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your test configuration in `.env.local`:
```bash
# Required
PLAYWRIGHT_BASE_URL=http://localhost:5173
E2E_USER_EMAIL="test@example.com"
E2E_USER_PASSWORD="secret123"

# Expected counts
E2E_MY_USER_PROFILE_URL="/#/perfil/me"
E2E_EXPECT_LAUNCHED_COUNT="9"

# Optional
E2E_PUBLIC_PROFILE_URL="/#/perfil/<slug-or-id>"
E2E_KNOWN_PROGRESS_ID="f2fd1d10-050e-4435-a215-5e0377697fba"
```

### B) Using npm

1. Install Playwright browsers:
```bash
npx playwright install
```

2. Follow steps 2-3 from above

## Running Tests

### Using pnpm (recommended)

```bash
# Smoke suite (headless)
pnpm test:e2e:smoke

# Headed mode (see browser)
pnpm test:e2e:headed

# Full smoke suite with environment variables (macOS/Linux)
PLAYWRIGHT_BASE_URL=http://localhost:5173 \
E2E_USER_EMAIL="test@example.com" \
E2E_USER_PASSWORD="secret123" \
E2E_MY_USER_PROFILE_URL="/#/perfil/me" \
E2E_EXPECT_LAUNCHED_COUNT="9" \
pnpm test:e2e:headed

# Windows (PowerShell)
$env:PLAYWRIGHT_BASE_URL="http://localhost:5173"; $env:E2E_USER_EMAIL="test@example.com"; $env:E2E_USER_PASSWORD="secret123"; $env:E2E_MY_USER_PROFILE_URL="/#/perfil/me"; $env:E2E_EXPECT_LAUNCHED_COUNT="9"; pnpm test:e2e:headed

# Specific test
pnpm test:e2e:headed tests/e2e/smoke.raffles.spec.ts
```

### Using npm

```bash
# Replace pnpm with npm in any of the above commands
npm run test:e2e:smoke
npm run test:e2e:headed
```

## What These Tests Catch

- **Exact count verification**: Your launched raffles shows exactly the expected count (no duplication/leakage)
- **Progress bar functionality**: At least one raffle has >0% progress (data merge working)
- **Buy button state**: Buttons are enabled for active raffles
- **No API errors**: No 400/500 responses during the flow
- **No !inner joins**: Ensures we don't use problematic joins that cause 400 errors
- **Cross-page consistency**: Homepage vs profile progress matching

## Test Structure

- `helpers/auth.ts` - Login automation
- `smoke.raffles.spec.ts` - Main smoke tests
  - MyLaunched page verification
  - Public profile verification  
  - Progress parity check