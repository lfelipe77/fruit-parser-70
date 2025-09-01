import { test, expect } from '@playwright/test';
import { loginUI } from './helpers/auth';

const USER_EMAIL = process.env.E2E_USER_EMAIL!;
const USER_PASSWORD = process.env.E2E_USER_PASSWORD!;
const PROFILE_URL = process.env.E2E_PROFILE_URL || '/#/perfil/me';

test.describe('Avatar cache-bust', () => {
  test('uploading avatar updates ?v= timestamp', async ({ page }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'E2E env vars not set');

    // 1) Login
    await loginUI(page, USER_EMAIL, USER_PASSWORD);

    // 2) Go to profile page
    await page.goto(PROFILE_URL);

    // 3) Grab current avatar src
    const img = page.getByTestId('user-avatar');
    const beforeSrc = await img.getAttribute('src');

    // 4) Upload new avatar (using file input)
    // Adjust selector to match your file input
    const input = page.locator('input[type="file"]');
    await input.setInputFiles('tests/e2e/fixtures/avatar-sample.webp');

    // 5) Click save
    await page.getByRole('button', { name: /salvar/i }).click();

    // 6) Wait for avatar src to update with new ?v=
    await expect(async () => {
      const afterSrc = await img.getAttribute('src');
      expect(afterSrc).not.toEqual(beforeSrc);
      expect(afterSrc).toMatch(/\?v=\d+$/);
    }).toPass({ timeout: 5000 });
  });

  test('avatar displays immediately after crop', async ({ page }) => {
    test.skip(!USER_EMAIL || !USER_PASSWORD, 'E2E env vars not set');

    await loginUI(page, USER_EMAIL, USER_PASSWORD);
    await page.goto(PROFILE_URL);

    // Upload and crop workflow
    const input = page.locator('input[type="file"]');
    await input.setInputFiles('tests/e2e/fixtures/avatar-sample.webp');

    // Wait for cropper to appear and crop
    const cropButton = page.getByRole('button', { name: /crop|cortar/i });
    if (await cropButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cropButton.click();
    }

    // Verify preview shows cropped image
    const preview = page.getByTestId('avatar-preview');
    if (await preview.isVisible().catch(() => false)) {
      const previewSrc = await preview.getAttribute('src');
      expect(previewSrc).toMatch(/^blob:/);
    }

    // Save and verify final update
    await page.getByRole('button', { name: /salvar/i }).click();
    
    // Verify main avatar updated
    const mainAvatar = page.getByTestId('user-avatar');
    await expect(async () => {
      const src = await mainAvatar.getAttribute('src');
      expect(src).toMatch(/\?v=\d+$/);
    }).toPass({ timeout: 5000 });
  });
});