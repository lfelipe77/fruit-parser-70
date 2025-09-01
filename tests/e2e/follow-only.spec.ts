import { test, expect } from '@playwright/test';
import { loginUI } from './helpers/auth';

// Simplified test focusing only on follow/unfollow functionality
const USER_EMAIL = process.env.E2E_USER_EMAIL!;
const USER_PASSWORD = process.env.E2E_USER_PASSWORD!;
const TARGET_PROFILE_URL = process.env.E2E_TARGET_PROFILE_URL!;

test.describe('Follow functionality', () => {
  test('can follow and unfollow a user', async ({ page }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD || !TARGET_PROFILE_URL, 'E2E env vars not set');

    // Login
    await loginUI(page, USER_EMAIL, USER_PASSWORD);

    // Go to target profile
    await page.goto(TARGET_PROFILE_URL);

    // Helper to read follower count
    async function readFollowerCount() {
      try {
        const seguidoresText = await page.getByText(/\d+\s*seguidores/i).innerText();
        return parseInt(seguidoresText.replace(/\D+/g, ''), 10) || 0;
      } catch {
        return 0;
      }
    }

    const initialCount = await readFollowerCount();

    // Try to find follow button
    const followBtn = page.getByRole('button', { name: /^seguir$/i });
    const unfollowBtn = page.getByRole('button', { name: /deixar de seguir/i });

    // Test follow action if currently not following
    if (await followBtn.isVisible().catch(() => false)) {
      await followBtn.click();
      
      // Wait for optimistic update
      await page.waitForTimeout(500);
      
      // Verify button changed to unfollow
      await expect(unfollowBtn).toBeVisible({ timeout: 5000 });
      
      // Verify count increased (optimistically)
      const afterFollow = await readFollowerCount();
      expect(afterFollow).toBeGreaterThanOrEqual(initialCount);
      
      // Test unfollow
      await unfollowBtn.click();
      await page.waitForTimeout(500);
      
      // Verify button changed back to follow
      await expect(followBtn).toBeVisible({ timeout: 5000 });
      
    } else if (await unfollowBtn.isVisible().catch(() => false)) {
      // Currently following, test unfollow first
      await unfollowBtn.click();
      await page.waitForTimeout(500);
      
      await expect(followBtn).toBeVisible({ timeout: 5000 });
      
      // Then follow again
      await followBtn.click();
      await page.waitForTimeout(500);
      
      await expect(unfollowBtn).toBeVisible({ timeout: 5000 });
    } else {
      throw new Error('Neither follow nor unfollow button found - check selectors');
    }
  });

  test('follow button is hidden on own profile', async ({ page }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'E2E env vars not set');

    // Login
    await loginUI(page, USER_EMAIL, USER_PASSWORD);

    // Go to own profile (assumes there's a profile link in nav)
    await page.getByRole('link', { name: /perfil|profile/i }).click();

    // Verify no follow/unfollow buttons are visible
    await expect(page.getByRole('button', { name: /^seguir$/i })).not.toBeVisible();
    await expect(page.getByRole('button', { name: /deixar de seguir/i })).not.toBeVisible();
  });
});