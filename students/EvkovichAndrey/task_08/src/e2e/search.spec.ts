import { test, expect } from '@playwright/test';

test('search artist and see results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('abba');
  await page.getByRole('button', { name: /search/i }).click();
  await expect(page.getByText('ABBA')).toBeVisible();
});

test('navigate to artist details', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox').fill('radiohead');
  await page.getByRole('button', { name: /search/i }).click();
  await page.getByText(/Radiohead/i).click();
  await expect(page.getByRole('heading', { name: /Radiohead/i })).toBeVisible();
});
