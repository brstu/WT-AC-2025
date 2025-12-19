const { test, expect } = require('@playwright/test');

test.describe('Event Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should load events page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Event Management');
    await expect(page.locator('.event-card')).toHaveCount(2);
  });

  test('should create new event', async ({ page }) => {
    // Заполняем форму
    await page.fill('#title', 'Playwright Test Event');
    await page.fill('#date', '2024-12-31');
    await page.fill('#time', '23:59');
    await page.fill('#location', 'E2E Test Location');
    await page.fill('#description', 'This is an E2E test event');
    await page.fill('#attendees', '100');

    // Отправляем форму
    await page.click('button[type="submit"]');

    // Проверяем уведомление
    await expect(page.locator('.event-card:has-text("Playwright Test Event")')).toBeVisible();
  });

  test('should delete event', async ({ page }) => {
    // Считаем количество событий до удаления
    const initialCount = await page.locator('.event-card').count();
    
    // Нажимаем кнопку удаления на первом событии
    await page.locator('.delete-btn').first().click();
    
    // Подтверждаем в диалоговом окне
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // Проверяем, что количество уменьшилось
    await expect(page.locator('.event-card')).toHaveCount(initialCount - 1);
  });

  test('should display error on failed load', async ({ page }) => {
    // Мокаем ошибку сети
    await page.route('**/api/events', route => route.abort());
    
    // Перезагружаем страницу
    await page.reload();
    
    // Проверяем сообщение об ошибке
    await expect(page.locator('.error')).toBeVisible();
  });
});