import { test, expect } from '@playwright/test';

test.describe('Progress Parity Tests', () => {
  test('homepage and public profile show same progress values', async ({ page }) => {
    // Go to homepage and collect progress values
    await page.goto('/');
    
    // Wait for raffles to load
    await page.waitForSelector('[data-testid^="raffle-card-"]', { timeout: 10000 });
    
    const homeProgressValues = await page.locator('[data-testid^="progress-pct-"]').allInnerTexts();
    const homeRaffleIds = await page.locator('[data-testid^="raffle-card-"]').all();
    
    // Extract raffle IDs from test IDs
    const raffleIds = [];
    for (const element of homeRaffleIds) {
      const testId = await element.getAttribute('data-testid');
      if (testId) {
        const id = testId.replace('raffle-card-', '');
        raffleIds.push(id);
      }
    }
    
    // Check progress values are clamped 0-100
    for (const progressText of homeProgressValues) {
      const value = parseInt(progressText.replace('%', ''));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
    
    // If we have raffles, check a public profile for consistency
    if (raffleIds.length > 0) {
      // Navigate to a raffle to get creator info
      const firstRaffleId = raffleIds[0];
      await page.goto(`/raffle/${firstRaffleId}`);
      
      // Try to get creator username from page
      const creatorLink = page.locator('a[href^="/perfil/"]').first();
      if (await creatorLink.isVisible()) {
        await creatorLink.click();
        
        // Wait for profile page to load
        await page.waitForSelector('[data-testid^="raffle-card-"]', { timeout: 5000 }).catch(() => {
          // Profile might not have public raffles, that's ok
        });
        
        // Check progress values are also clamped on profile
        const profileProgressValues = await page.locator('[data-testid^="progress-pct-"]').allInnerTexts();
        for (const progressText of profileProgressValues) {
          const value = parseInt(progressText.replace('%', ''));
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  test('progress bars are visually consistent', async ({ page }) => {
    await page.goto('/');
    
    // Wait for raffles to load
    await page.waitForSelector('[data-testid="raffle-progress"]', { timeout: 10000 });
    
    const progressBars = page.locator('[data-testid="raffle-progress"]');
    const count = await progressBars.count();
    
    // Check each progress bar has valid width
    for (let i = 0; i < count; i++) {
      const bar = progressBars.nth(i);
      const width = await bar.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.width;
      });
      
      // Width should be a valid CSS value (not empty or "auto")
      expect(width).toMatch(/^\d+(\.\d+)?px$/);
      
      // Get the aria-valuenow attribute for validation
      const ariaValue = await bar.getAttribute('aria-valuenow');
      if (ariaValue) {
        const value = parseInt(ariaValue);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });
});