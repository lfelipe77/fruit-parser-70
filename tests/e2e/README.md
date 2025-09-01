# E2E tests (Playwright)

## Setup
First, add these scripts to your `package.json`:
```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui", 
  "test:e2e:headed": "playwright test --headed"
}
```

## Environment Variables
- `PLAYWRIGHT_BASE_URL` (default `http://localhost:5173`)
- `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` → an existing test user with password
- `E2E_TARGET_PROFILE_URL` → e.g. `/#/perfil/gabiarmua` (or the profile UUID route)

## Run
- `pnpm dlx playwright install` (first time)
- `PLAYWRIGHT_BASE_URL=http://localhost:5173 E2E_USER_EMAIL=... E2E_USER_PASSWORD=... E2E_TARGET_PROFILE_URL="/#/perfil/..." pnpm test:e2e`
- For UI mode: `pnpm test:e2e:ui`

## Selectors to verify match your app:

- If your login route is not `/#/login`, update `loginUI` accordingly.
- If your login form labels differ, adjust the `getByLabel/getByRole` queries.
- If the message button text differs, update the regex `/enviar mensagem|abrir conversa/i`.
- If counts are rendered differently, adjust the `readCounts()` parsing.

Fix any TypeScript or ESLint warnings introduced by these files.

## How to run locally
1) Create or use a test user with a password (not OAuth) and pick a profile URL to target.  
2) Run:
```bash
pnpm dlx playwright install
PLAYWRIGHT_BASE_URL=http://localhost:5173 \
E2E_USER_EMAIL="test@example.com" \
E2E_USER_PASSWORD="secret123" \
E2E_TARGET_PROFILE_URL="/#/perfil/gabiarmua" \
pnpm test:e2e
```

If anything fails (e.g., a selector doesn't match your UI text), tell me which step and I'll tailor the selectors to your exact components.