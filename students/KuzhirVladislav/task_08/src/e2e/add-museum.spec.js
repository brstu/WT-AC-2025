import { test, expect } from '@playwright/test';

test('create new museum', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await page.goto('http://localhost:5173/new');
  await page.fill('input[name="title"]', 'New Test Museum');
  await page.fill('input[name="body"]', 'Description');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL('/');
  await expect(page.getByText('New Test Museum')).toBeVisible();
});
