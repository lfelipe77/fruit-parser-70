import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL!;
const PUBLIC_PROFILE = process.env.E2E_PUBLIC_PROFILE_URL!;
const KNOWN_ID = process.env.E2E_KNOWN_PROGRESS_ID!;

test('progress matches between Home and Public Profile', async ({ page }) => {
  test.skip(!PUBLIC_PROFILE || !KNOWN_ID, 'Missing PUBLIC_PROFILE or KNOWN_ID env vars');

  await page.goto(`${BASE}/#/`);
  const h = parseInt((await page.getByTestId(`progress-pct-${KNOWN_ID}`).innerText()).replace(/\D+/g,''),10)||0;

  await page.goto(`${BASE}${PUBLIC_PROFILE}`);
  const p = parseInt((await page.getByTestId(`progress-pct-${KNOWN_ID}`).innerText()).replace(/\D+/g,''),10)||0;

  expect(p).toBe(h);
});