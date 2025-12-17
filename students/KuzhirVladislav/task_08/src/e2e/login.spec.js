import { test, expect } from '@playwright/test';

test('login with admin', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await expect(page.locator('text=New')).toBeVisible();
});
