import { Page, expect } from '@playwright/test';

export async function loginUI(page: Page, email: string, password: string) {
  await page.goto(process.env.PLAYWRIGHT_BASE_URL!);
  await page.getByRole('link', { name: /entrar|login/i }).click();
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await expect(page.getByTestId('profile-avatar')).toBeVisible({ timeout: 20_000 });
}