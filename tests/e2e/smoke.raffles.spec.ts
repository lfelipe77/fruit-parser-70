import { test, expect } from '@playwright/test';
import { loginUI } from './helpers/auth';

const BASE = process.env.PLAYWRIGHT_BASE_URL!;
const MY_URL = process.env.E2E_MY_USER_PROFILE_URL || '/#/perfil/me';
const PUB_URL = process.env.E2E_PUBLIC_PROFILE_URL; // optional
const EXPECT_COUNT = parseInt(process.env.E2E_EXPECT_LAUNCHED_COUNT || '0', 10);
const KNOWN_PROGRESS_ID = process.env.E2E_KNOWN_PROGRESS_ID;

test.describe('Ganhavel smoke', () => {
  test.beforeAll(() => {
    if (!BASE) throw new Error('PLAYWRIGHT_BASE_URL not set');
  });

  test('MyLaunched shows exactly my count, at least one >0% progress, no 400s, no !inner joins', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL!;
    const pw = process.env.E2E_USER_PASSWORD!;
    test.skip(!email || !pw || !EXPECT_COUNT, 'missing envs');

    const badResponses: { url: string; status: number }[] = [];
    const badRequests: string[] = [];

    page.on('response', async (res) => {
      if (res.status() >= 400) badResponses.push({ url: res.url(), status: res.status() });
    });
    page.on('request', (req) => {
      const url = req.url();
      if (/%21inner/.test(url) || /!inner/.test(url)) badRequests.push(url);
    });

    await loginUI(page, email, pw);

    // go to my profile launched list with debug
    await page.goto(`${BASE}${MY_URL}?debug=1`);
    await page.waitForTimeout(500); // let logs settle

    // count cards (use a stable testid on each card root if you have it; fallback to images)
    const cards = page.locator('[data-testid="raffle-card"], img[alt*="Ganhavel"], [data-testid^="progress-pct-"]');
    await expect(cards).toHaveCount(EXPECT_COUNT, { timeout: 15_000 });

    // ensure at least one progress > 0 (uses the progress testid you added earlier)
    const progressBars = page.getByTestId('raffle-progress');
    await expect(progressBars.first()).toBeVisible();
    // grab all pct labels if you render them:
    const pctLabels = await page.locator('[data-testid^="progress-pct-"]').allInnerTexts().catch(() => []);
    const somePositive = pctLabels.some(t => {
      const n = parseInt(String(t).replace(/\D+/g, ''), 10);
      return Number.isFinite(n) && n > 0;
    });
    // fallback: if pct labels are not rendered, rely on a known raffle id
    if (!somePositive && KNOWN_PROGRESS_ID) {
      const pct = await page.getByTestId(`progress-pct-${KNOWN_PROGRESS_ID}`).innerText().catch(() => '0');
      const n = parseInt(pct.replace(/\D+/g, ''), 10) || 0;
      expect(n).toBeGreaterThan(0);
    } else {
      expect(somePositive).toBeTruthy();
    }

    // Buy button is enabled for at least one active item (if action button has testid)
    const anyBuyEnabled = await page.locator('[data-testid="buy-button"]:not([disabled])').first().isVisible().catch(() => false);
    expect(anyBuyEnabled).toBeTruthy();

    // assert: no 400/500 and no !inner in REST calls
    expect(badResponses, `bad responses: ${JSON.stringify(badResponses, null, 2)}`).toHaveLength(0);
    expect(badRequests, `bad requests (found !inner): ${badRequests.join('\n')}`).toHaveLength(0);
  });

  test('Public profile launched shows progress (matches homepage semantics)', async ({ page }) => {
    test.skip(!PUB_URL, 'no public profile provided');
    const badResponses: { url: string; status: number }[] = [];
    page.on('response', (res) => { if (res.status() >= 400) badResponses.push({ url: res.url(), status: res.status() }); });

    await page.goto(`${BASE}${PUB_URL}?debug=1`);
    // ensure at least one progress bar exists and has width > 0 for some
    const bars = page.getByTestId('raffle-progress');
    await expect(bars.first()).toBeVisible({ timeout: 15_000 });

    // if you render numeric labels:
    const labels = await page.locator('[data-testid^="progress-pct-"]').allInnerTexts().catch(() => []);
    const anyPositive = labels.some(t => (parseInt(t.replace(/\D+/g, ''), 10) || 0) > 0);
    expect(anyPositive).toBeTruthy();

    expect(badResponses, `bad responses: ${JSON.stringify(badResponses, null, 2)}`).toHaveLength(0);
  });

  test('Homepage vs Profile progress parity', async ({ page }) => {
    test.skip(!KNOWN_PROGRESS_ID, 'no known progress ID provided');
    
    // Get progress from homepage
    await page.goto(`${BASE}/?debug=1`);
    await page.waitForTimeout(500);
    
    const homeProgress = await page.getByTestId(`progress-pct-${KNOWN_PROGRESS_ID}`).innerText().catch(() => '0');
    const homePct = parseInt(homeProgress.replace(/\D+/g, ''), 10) || 0;
    
    // Get progress from public profile (if URL provided)
    if (PUB_URL) {
      await page.goto(`${BASE}${PUB_URL}?debug=1`);
      await page.waitForTimeout(500);
      
      const profileProgress = await page.getByTestId(`progress-pct-${KNOWN_PROGRESS_ID}`).innerText().catch(() => '0');
      const profilePct = parseInt(profileProgress.replace(/\D+/g, ''), 10) || 0;
      
      // Progress should match between homepage and profile
      expect(profilePct).toBe(homePct);
    }
    
    // At minimum, ensure progress is > 0
    expect(homePct).toBeGreaterThan(0);
  });
});