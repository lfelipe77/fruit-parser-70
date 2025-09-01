import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Avatar Upload E2E', () => {
  test('should upload avatar and update profile', async ({ page }) => {
    // Login first (adjust login flow to match your app)
    await page.goto('/');
    await page.click('text=Login');
    
    // Fill login form (adjust selectors to match your login form)
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    
    // Wait for successful login and navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to profile page
    await page.goto('/profile');
    await page.waitForSelector('[data-testid="profile-page"]', { timeout: 5000 });
    
    // Get initial avatar src for comparison
    const initialAvatarSrc = await page.getAttribute('img[alt*="avatar"]', 'src') || '';
    
    // Upload avatar file
    const testImagePath = path.join(__dirname, 'fixtures/test-avatar.png');
    
    // Click avatar upload button
    await page.click('[data-testid="avatar-upload-button"]');
    
    // Upload file
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(testImagePath);
    
    // Wait for cropper modal to appear
    await page.waitForSelector('[data-testid="avatar-cropper"]', { timeout: 5000 });
    
    // Confirm crop (adjust selector to match your cropper save button)
    await page.click('[data-testid="cropper-save"]');
    
    // Wait for cropper to close
    await page.waitForSelector('[data-testid="avatar-cropper"]', { state: 'hidden' });
    
    // Save profile changes
    await page.click('[data-testid="save-profile"]');
    
    // Wait for success toast
    await page.waitForSelector('text=Perfil atualizado', { timeout: 10000 });
    
    // Wait a moment for UI to update
    await page.waitForTimeout(2000);
    
    // Get updated avatar src
    const updatedAvatarSrc = await page.getAttribute('img[alt*="avatar"]', 'src') || '';
    
    // Verify avatar src changed and has cache-busting parameter
    expect(updatedAvatarSrc).not.toBe(initialAvatarSrc);
    expect(updatedAvatarSrc).toMatch(/\?.*v=\d+/); // Has cache-busting parameter
    
    // Verify updated_at timestamp advanced (would require database access or API check)
    // This is a simplified version - in practice you'd check the database
    console.log('Avatar upload test completed successfully');
    console.log('Initial src:', initialAvatarSrc);
    console.log('Updated src:', updatedAvatarSrc);
  });
  
  test('should reject oversized files', async ({ page }) => {
    await page.goto('/profile');
    
    // Try to upload a file > 5MB (create a large test file)
    const largeImagePath = path.join(__dirname, 'fixtures/large-image.png');
    
    await page.click('[data-testid="avatar-upload-button"]');
    
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(largeImagePath);
    
    // Should show error toast
    await page.waitForSelector('text=Image too large', { timeout: 5000 });
  });
  
  test('should reject invalid file types', async ({ page }) => {
    await page.goto('/profile');
    
    const invalidFilePath = path.join(__dirname, 'fixtures/test-document.pdf');
    
    await page.click('[data-testid="avatar-upload-button"]');
    
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles(invalidFilePath);
    
    // Should show error toast
    await page.waitForSelector('text=Invalid file type', { timeout: 5000 });
  });
});