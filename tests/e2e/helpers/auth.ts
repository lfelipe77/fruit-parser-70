import { Page, expect } from '@playwright/test';

// Assumes your app has an email/password login form.
// Update the selectors below to match your actual inputs/buttons.
export async function loginUI(page: Page, email: string, password: string) {
  // Go to login page
  await page.goto('/#/login'); // <-- adjust if your route differs

  // Fill and submit
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();

  // Wait until we can see user nav or profile indicator
  await expect(page.getByRole('link', { name: /perfil|profile/i })).toBeVisible({ timeout: 15000 });
}