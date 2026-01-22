import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  
  await expect(page.getByText('Справочник кофеен')).toBeVisible();
});

test('shows coffee shops', async ({ page }) => {
  await page.goto('/');
  
  // Ждем загрузку
  await page.waitForTimeout(2000);
  
  await expect(page.getByText('Найдено кофеен:')).toBeVisible();
});
