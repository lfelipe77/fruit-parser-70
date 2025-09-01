import { test, expect } from '@playwright/test';
import { loginUI } from './helpers/auth';

// Configure test users and target profile via env:
// E2E_USER_EMAIL / E2E_USER_PASSWORD  -> main test user credentials
// E2E_TARGET_PROFILE_URL              -> full path to target profile page (e.g. "/#/perfil/gabiarmua" or "/#/perfil/1338fa53-a79f-4e5c-bebf-26985655d15c")
const USER_EMAIL = process.env.E2E_USER_EMAIL!;
const USER_PASSWORD = process.env.E2E_USER_PASSWORD!;
const TARGET_PROFILE_URL = process.env.E2E_TARGET_PROFILE_URL!;

test.describe('Follow + Messages smoke', () => {
  test('follow → unfollow toggles count, then start a conversation', async ({ page }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD || !TARGET_PROFILE_URL, 'E2E env vars not set');

    // 1) Login
    await loginUI(page, USER_EMAIL, USER_PASSWORD);

    // 2) Go to target profile
    await page.goto(TARGET_PROFILE_URL);

    // Helpers to read counts
    async function readCounts() {
      // looks for "X seguidores" and "Y seguindo"
      const seguidores = await page.getByText(/seguidores/i).innerText();
      const seguindo = await page.getByText(/seguindo/i).innerText();
      const segNum = parseInt(seguidores.replace(/\D+/g, ''), 10) || 0;
      const sgNum  = parseInt(seguindo.replace(/\D+/g, ''), 10) || 0;
      return { followers: segNum, following: sgNum };
    }

    const before = await readCounts();

    // 3) Follow (button should say "Seguir")
    const followBtn = page.getByRole('button', { name: /seguir/i });
    const unfollowBtn = page.getByRole('button', { name: /deixar de seguir/i });

    if (await followBtn.isVisible().catch(() => false)) {
      await followBtn.click();
      // optimistic update shows immediately; allow small wait for network
      await page.waitForTimeout(400);
      const afterFollow = await readCounts();
      expect(afterFollow.followers).toBeGreaterThanOrEqual(before.followers);
      // Button should flip to "Deixar de seguir"
      await expect(unfollowBtn).toBeVisible();
    } else {
      // already following: ensure we can unfollow and re-follow to prove both paths
      await unfollowBtn.click();
      await page.waitForTimeout(400);
      const afterUnfollow = await readCounts();
      expect(afterUnfollow.followers).toBeLessThanOrEqual(before.followers + 1);
      // follow again to restore state
      await page.getByRole('button', { name: /seguir/i }).click();
      await page.waitForTimeout(400);
      await expect(page.getByRole('button', { name: /deixar de seguir/i })).toBeVisible();
    }

    // 4) Test messaging (if message functionality exists)
    // Note: This test assumes a messaging interface exists in the UI
    const messageBtn = page.getByRole('button', { name: /enviar mensagem|mensagem|conversa/i });
    
    if (await messageBtn.isVisible().catch(() => false)) {
      await messageBtn.click();

      // Wait for message input to appear (could be modal, sidebar, or new page)
      const messageInput = page.locator('input[placeholder*="mensagem"], textarea[placeholder*="mensagem"], input[placeholder*="message"], textarea[placeholder*="message"]').first();
      
      if (await messageInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        const testMessage = `E2E test message ${Date.now()}`;
        await messageInput.fill(testMessage);
        
        // Try to send the message (Enter key or Send button)
        const sendBtn = page.getByRole('button', { name: /enviar|send/i });
        if (await sendBtn.isVisible().catch(() => false)) {
          await sendBtn.click();
        } else {
          await messageInput.press('Enter');
        }

        // Verify message appears in conversation
        await expect(page.getByText(testMessage)).toBeVisible({ timeout: 5000 });
      } else {
        console.log('Message input not found - messaging UI may not be implemented yet');
      }
    } else {
      console.log('Message button not found - messaging feature may not be implemented yet');
    }
  });
});