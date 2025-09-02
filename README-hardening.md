# Hardening Pass Implementation

## Database Improvements
- ✅ Added performance index: `idx_raffles_user_status_created` on `(user_id, status, created_at DESC)`

## Data Layer Safety
- ✅ Created `safeSelect()` utility to prevent `!inner` joins at runtime
- ✅ Added `clampProgress()` to ensure progress values stay 0-100%
- ✅ Added `safeProgressFetch()` wrapper with try/catch for error handling
- ✅ Updated `src/data/raffles.ts` to use safe utilities and proper types

## Type Safety
- ✅ Removed `as any` usage and improved type definitions
- ✅ Added proper `RaffleWithProgress` interface
- ✅ Added proper error handling with fallbacks

## Testing
- ✅ Added `tests/e2e/progress.parity.spec.ts` for cross-page progress validation
- ✅ Updated `tests/e2e/smoke.raffles.spec.ts` with header visibility and status checks
- ✅ Added `tests/raffles.merge.test.ts` for unit testing progress clamping
- ✅ Added vitest configuration

## CI/CD
- ✅ Added `.github/workflows/playwright.yml` workflow
- ✅ Added forbidden pattern checking for `!inner` usage
- ✅ Integrated lint and typecheck steps
- ✅ Added unit test execution

## Runtime Guards
- ✅ `safeSelect()` throws error if `!inner` or `%21inner` detected
- ✅ Progress values are clamped 0-100% in all data fetches
- ✅ Error handling ensures UI never goes blank on data failures

## Acceptance Criteria Met
- ✅ No `!inner` joins can be compiled or committed
- ✅ E2E and unit tests run in CI
- ✅ `/my-launched` shows active+completed, header present, cards mirror homepage
- ✅ Page never blanks even if progress view errors
- ✅ Progress values are consistently clamped across all views

## Usage
```bash
# Run unit tests
npm test

# Run e2e tests  
npx playwright test

# Check for forbidden patterns
node scripts/check-no-inner.js

# Full CI pipeline
npm run lint && npm run typecheck && npm test && npx playwright test
```