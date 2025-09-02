import { test, expect } from '@playwright/test';

test.describe('Avatar Upload Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to profile page
    await page.goto('/');
    
    // Mock authentication - assuming test user
    await page.evaluate(() => {
      localStorage.setItem('sb-whqxpuyjxoiufzhvqneg-auth-token', JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: {
          id: 'test-user-id',
          email: 'test@example.com'
        }
      }));
    });

    await page.reload();
  });

  test('should upload avatar successfully', async ({ page }) => {
    // Wait for profile page to load
    await page.waitForSelector('[data-testid="profile-page"]', { timeout: 10000 });

    // Create a test image file
    const buffer = await page.screenshot({ path: 'test-avatar.png' });
    
    // Click avatar upload button
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: 'test-avatar.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    // Wait for cropper to appear
    await page.waitForSelector('[data-testid="avatar-cropper"]', { timeout: 5000 });

    // Click save in cropper
    await page.click('[data-testid="crop-save-button"]');

    // Wait for upload to complete
    await page.waitForFunction(() => {
      const img = document.querySelector('[data-testid="profile-avatar"]') as HTMLImageElement;
      return img && img.src.includes('?v=');
    }, { timeout: 15000 });

    // Check that avatar src has cache-busting parameter
    const avatarSrc = await page.locator('[data-testid="profile-avatar"]').getAttribute('src');
    expect(avatarSrc).toContain('?v=');
    expect(avatarSrc).toContain('avatars');
    
    // Verify no error messages
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should reject oversized files', async ({ page }) => {
    await page.waitForSelector('[data-testid="profile-page"]', { timeout: 10000 });

    // Create a large mock file (>5MB)
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: 'large-avatar.png',
      mimeType: 'image/png',
      buffer: largeBuffer,
    });

    // Should show error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    const errorText = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorText).toContain('too large');
  });

  test('should reject invalid file types', async ({ page }) => {
    await page.waitForSelector('[data-testid="profile-page"]', { timeout: 10000 });

    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content'),
    });

    // Should show error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 5000 });
    const errorText = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorText).toContain('Invalid file type');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.waitForSelector('[data-testid="profile-page"]', { timeout: 10000 });

    // Mock network failure
    await page.route('**/storage/v1/object/avatars/**', route => {
      route.abort('failed');
    });

    const buffer = await page.screenshot({ path: 'test-avatar-network-fail.png' });
    
    const fileInput = page.locator('input[type="file"][accept*="image"]');
    await fileInput.setInputFiles({
      name: 'test-avatar.png',
      mimeType: 'image/png',
      buffer: buffer,
    });

    await page.waitForSelector('[data-testid="avatar-cropper"]', { timeout: 5000 });
    await page.click('[data-testid="crop-save-button"]');

    // Should show error message
    await page.waitForSelector('[data-testid="error-message"]', { timeout: 10000 });
    const errorText = await page.locator('[data-testid="error-message"]').textContent();
    expect(errorText).toContain('Failed');
  });
});