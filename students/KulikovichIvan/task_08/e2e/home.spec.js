import { test, expect } from '@playwright/test';

test.describe('Главная страница базы подкастов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('должна иметь правильный заголовок', async ({ page }) => {
    await expect(page).toHaveTitle('База подкастов');
    await expect(page.locator('h1')).toContainText('База подкастов');
  });

  test('должна отображать список подкастов', async ({ page }) => {
    const podcastItems = page.locator('.podcast-item');
    await expect(podcastItems).toHaveCount(3);
    
    await expect(page.getByText('React для начинающих')).toBeVisible();
    await expect(page.getByText('Алексей Луковец')).toBeVisible();
    await expect(page.getByText('01:00:00')).toBeVisible();
  });

  test('должна иметь правильную структуру элементов', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.podcast-list')).toBeVisible();
  });
});