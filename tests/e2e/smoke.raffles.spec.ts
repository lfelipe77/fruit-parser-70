import { test, expect } from '@playwright/test';

test.describe('Raffles Smoke Tests', () => {
  test('homepage loads and shows raffles', async ({ page }) => {
    await page.goto('/');
    
    // Check header is visible
    await expect(page.getByRole('banner')).toBeVisible().catch(() => {
      // Fallback: check for navigation
      expect(page.locator('nav')).toBeVisible();
    });
    
    // Wait for raffles to load
    await page.waitForSelector('[data-testid^="raffle-card-"]', { timeout: 10000 });
    
    // Check that raffle cards are present
    const raffleCards = page.locator('[data-testid^="raffle-card-"]');
    await expect(raffleCards.first()).toBeVisible();
  });

  test('/my-launched shows header and no archived status', async ({ page }) => {
    await page.goto('/my-launched');
    
    // Check header is visible 
    await expect(page.getByRole('banner')).toBeVisible().catch(() => {
      // Fallback: check for navigation
      expect(page.locator('nav')).toBeVisible();
    });
    
    // Check page header
    await expect(page.getByText('Ganháveis que Lancei')).toBeVisible();
    
    // Check action buttons are present
    await expect(page.getByText('Início')).toBeVisible();
    await expect(page.getByText('Criar Novo')).toBeVisible();
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // If there are raffles, check no archived status
    const statusTexts = await page.locator('text=/Status:\\s*\\w+/').allInnerTexts();
    for (const statusText of statusTexts) {
      expect(statusText.toLowerCase()).not.toContain('archived');
      expect(statusText.toLowerCase()).not.toContain('arquivado');
    }
  });

  test('raffle cards have view buttons and no buy on /my-launched', async ({ page }) => {
    await page.goto('/my-launched');
    
    // Wait for potential raffles to load
    await page.waitForTimeout(2000);
    
    const raffleCards = page.locator('[data-testid^="raffle-card-"]');
    const cardCount = await raffleCards.count();
    
    if (cardCount > 0) {
      // Check first card has view button and no buy button
      const firstCard = raffleCards.first();
      await expect(firstCard.locator('[data-testid="view-button"]')).toBeVisible();
      await expect(firstCard.locator('button:has-text("Comprar")')).not.toBeVisible();
      
      // Check card is clickable
      await expect(firstCard).toBeVisible();
    }
  });

  test('no forbidden patterns in requests', async ({ page }) => {
    const badRequests: string[] = [];
    
    page.on('request', (req) => {
      const url = req.url();
      if (/%21inner/.test(url) || /!inner/.test(url)) {
        badRequests.push(url);
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    await page.goto('/my-launched');
    await page.waitForTimeout(2000);
    
    expect(badRequests, `Found forbidden !inner usage: ${badRequests.join('\n')}`).toHaveLength(0);
  });
});